use std::{fs::File, io::Write};

use futures_util::SinkExt;
use lazy_static::lazy_static;
use reqwest::{Client, ClientBuilder, StatusCode};

use crate::windows::utils::{
  get_installer_file, get_ws,
  structs::{AHQStoreApplication, AppId, ErrorType, RefId, Response},
};
use std::time::Duration;

#[cfg(debug_assertions)]
use crate::windows::utils::write_log;

static URL: &str = "https://ahqstore-server.onrender.com";

lazy_static! {
    static ref CLIENT: Client = ClientBuilder::new()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36")
        .timeout(Duration::from_secs(60))
        .build()
        .unwrap();
}

pub async fn keep_alive() -> bool {
  #[cfg(debug_assertions)]
  write_log("KeepAlive: Running KeepAlive");

  if let Some(x) = CLIENT.get(URL).send().await.ok() {
    return match x.status() {
      StatusCode::UNAUTHORIZED => {
        #[cfg(debug_assertions)]
        write_log("KeepAlive: true");
        true
      }
      _ => {
        #[cfg(debug_assertions)]
        write_log("KeepAlive: SomethingElse Came");
        false
      }
    };
  }

  #[cfg(debug_assertions)]
  write_log("KeepAlive: Error");
  false
}

pub async fn download_app(ref_id: u64, app_id: &str) -> Option<AHQStoreApplication> {
  let app_id: AppId = app_id.into();
  let ws = get_ws().unwrap();

  let file = get_installer_file(&app_id);

  let app_id = get_app(0, app_id).await;

  match app_id {
    Response::AppData(_, id, data) => {
      if let None = async {
        let x = Response::as_msg(Response::DownloadStarted(ref_id, id.clone()));
        ws.send(x).await.ok()?;

        let mut resp = CLIENT.get(&data.download).send().await.ok()?;

        #[cfg(debug_assertions)]
        write_log("Response Successful");

        let mut file = File::create(&file).ok()?;

        #[cfg(debug_assertions)]
        write_log("File Successful");

        let total = resp.content_length().unwrap_or(0);
        let mut current = 0u64;

        let mut last = 0u64;

        loop {
          let byte = resp.chunk().await.ok()?;

          match byte {
            Some(x) => {
              current += x.len() as u64;
              file.write(&x).ok()?;

              let perc = (current * 100) / total;

              if last != perc {
                let msg = Response::as_msg(Response::DownloadProgress(
                  ref_id,
                  id.clone(),
                  [current, total],
                ));

                ws.send(msg).await.ok()?;
                last = perc;
              }
            }
            None => break,
          }
        }
        Some(())
      }
      .await
      {
        let x = Response::as_msg(Response::Error(ErrorType::AppInstallError(
          ref_id,
          id.clone(),
        )));
        let _ = ws.send(x).await;
        return None;
      }

      return Some(data);
    }
    resp => {
      let x = Response::as_msg(resp);
      let _ = ws.send(x).await;
      return None;
    }
  }
}

pub async fn get_app(ref_id: RefId, app_id: AppId) -> Response {
  let url = format!("{}/apps/id/{app_id}", &URL);

  if let Some(x) = CLIENT.get(url).send().await.ok() {
    if let Some(x) = x.json::<AHQStoreApplication>().await.ok() {
      return Response::AppData(ref_id, app_id, x);
    }
  }
  Response::Error(ErrorType::GetAppFailed(ref_id, app_id))
}
