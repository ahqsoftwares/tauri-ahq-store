use ahqstore_types::{AppStatus, Commit, Library};
use lazy_static::lazy_static;
use reqwest::{Client, ClientBuilder, StatusCode};
use std::{fs::File, io::Write};

#[allow(unused)]
use crate::{
  handlers::daemon::lib_msg,
  utils::{
    get_file_on_root, get_installer_file, get_iprocess,
    structs::{AHQStoreApplication, AppId, ErrorType, RefId, Response},
    ws_send,
  },
};
use std::time::Duration;

#[cfg(debug_assertions)]
use crate::utils::write_log;

#[cfg(windows)]
use super::unzip;

pub static mut GH_URL: Option<String> = None;

lazy_static! {
  static ref DOWNLOADER: Client = ClientBuilder::new()
      .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36")
      .build()
      .unwrap();

    static ref CLIENT: Client = ClientBuilder::new()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36")
        .timeout(Duration::from_secs(60))
        .build()
        .unwrap();

    static ref NODE21: &'static str = "https://nodejs.org/dist/v21.4.0/node-v21.4.0-win-x64.zip";
    static ref NODE20: &'static str = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-win-x64.zip";
}

pub fn init() {
  tokio::spawn(async {
    get_commit().await;
  });
}

pub async fn get_commit() -> u8 {
  if let Ok(resp) = CLIENT
    .get("https://api.github.com/repos/ahqstore/data/commits")
    .send()
    .await
  {
    if let Ok(mut data) = resp.json::<Vec<Commit>>().await {
      let data = data.remove(0);

      unsafe { GH_URL = Some(data.sha) }
      return 0;
    }
  }
  1
}

pub async fn download_app(val: &mut Library) -> Option<AHQStoreApplication> {
  let app_id = &val.app_id;
  let app_id = app_id.to_string();
  let app_id = get_app(0, app_id).await;

  match app_id {
    Response::AppData(_, _, data) => {
      let file = get_installer_file(&data);

      if let None = async {
        val.status = AppStatus::Downloading;

        println!(
          "{:?} {:?} {:?} {:?}",
          &data.downloadUrls,
          &data.install,
          &data.get_win32_download(),
          &data.get_linux_download(),
        );

        #[cfg(windows)]
        let mut resp = DOWNLOADER
          .get(&data.get_win32_download()?.url)
          .send()
          .await
          .ok()?;

        #[cfg(unix)]
        let mut resp = DOWNLOADER
          .get(&data.get_linux_download()?.url)
          .send()
          .await
          .ok()?;

        #[cfg(debug_assertions)]
        write_log("Response Successful");

        let mut file = File::create(&file).ok()?;

        #[cfg(debug_assertions)]
        write_log("File Successful");

        let total = resp.content_length().unwrap_or(0);
        let mut current = 0u64;

        let mut last = 0.0f64;

        loop {
          let byte = resp.chunk().await.ok()?;

          match byte {
            Some(x) => {
              current += x.len() as u64;
              file.write(&x).ok()?;

              let perc = ((current as f64) * 100.0) / (total as f64);

              if last != perc {
                val.progress = perc;
                last = perc;

                ws_send(&mut get_iprocess().unwrap(), &lib_msg()).await;
              }
            }
            None => break,
          }
        }
        Some(())
      }
      .await
      {
        return None;
      }

      return Some(data);
    }
    _ => {
      return None;
    }
  }
}

pub async fn get_app(ref_id: RefId, app_id: AppId) -> Response {
  let url = unsafe {
    if let Some(x) = GH_URL.as_ref() {
      x
    } else {
      return Response::Error(ErrorType::GetAppFailed(ref_id, app_id));
    }
  };
  let url = format!(
    "https://rawcdn.githack.com/ahqstore/data/{}/db/apps/{}.json",
    &url, &app_id
  );

  if let Some(x) = CLIENT.get(url).send().await.ok() {
    if let Some(x) = x.json::<AHQStoreApplication>().await.ok() {
      return Response::AppData(ref_id, app_id, x);
    }
  }
  Response::Error(ErrorType::GetAppFailed(ref_id, app_id))
}

#[cfg(windows)]
pub async fn install_node(version: &str) -> Option<()> {
  let (f_name, url) = match &version {
    &"v20" => ("node_20.zip", NODE20.to_string()),
    &"v21" => ("node_21.zip", NODE21.to_string()),
    _ => return None,
  };

  let zip = get_file_on_root(&f_name);

  let mut file = File::create(&zip).ok()?;

  write_download(&mut file, &url).await?;

  let true = unzip(&zip, &get_file_on_root(&format!("node-{}", &version)))
    .ok()?
    .wait()
    .ok()?
    .success()
  else {
    return None;
  };

  Some(())
}

#[cfg(windows)]
async fn write_download(file: &mut File, url: &str) -> Option<()> {
  let mut download = DOWNLOADER.get(url).send().await.ok()?;

  while let Some(chunk) = download.chunk().await.ok()? {
    file.write(&chunk).ok()?;
  }

  file.flush().ok()
}
