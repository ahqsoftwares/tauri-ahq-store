use ahqstore_types::{
  internet::{get_all_commits as t_get_commit, get_app as t_get_app}, AppStatus, Commit, Commits, Library
};
use lazy_static::lazy_static;
use reqwest::{Client, ClientBuilder, Request, StatusCode};
use serde_json::from_str;
use std::{
  fs::{self, File},
  io::Write,
};

use crate::utils::get_program_folder;
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

pub static mut COMMIT_ID: Option<Commits> = None;

lazy_static! {
  static ref DOWNLOADER: Client = ClientBuilder::new()
      .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36")
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
  if let Some(x) = t_get_commit(None).await.ok() {
    unsafe {
      COMMIT_ID = Some(x);
    }

    0
  } else {
    1
  }
}

pub async fn download_app(
  val: &mut Library,
) -> Option<(AHQStoreApplication, File, reqwest::Response)> {
  let app_id = &val.app_id;
  let app_id = app_id.to_string();
  let app_id = get_app(0, app_id).await;

  match app_id {
    Response::AppData(_, _, data) => {
      let file = get_installer_file(&data);

      val.app = Some(data.clone());
      val.status = AppStatus::Downloading;

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

      let _ = fs::remove_file(&file);
      let mut file = File::create(&file).ok()?;

      #[cfg(debug_assertions)]
      write_log("File Successful");

      let total = resp.content_length().unwrap_or(0);
      val.max = total as u64;

      let mut current = 0u64;

      let mut last = 0.0f64;

      Some((data, file, resp))
    }
    _ => {
      return None;
    }
  }
}

pub async fn get_app_local(ref_id: RefId, app_id: AppId) -> Response {
  let folder = get_program_folder(&app_id);

  let Ok(x) = fs::read_to_string(format!("{}/app.json", &folder)) else {
    return Response::Error(ErrorType::GetAppFailed(ref_id, app_id));
  };

  let Ok(x) = from_str(&x) else {
    return Response::Error(ErrorType::GetAppFailed(ref_id, app_id));
  };

  Response::AppData(ref_id, app_id, x)
}

pub async fn get_app(ref_id: RefId, app_id: AppId) -> Response {
  let app = t_get_app(unsafe { COMMIT_ID.as_ref().unwrap() }, &app_id).await;

  if let Ok(x) = app {
    return Response::AppData(ref_id, app_id, x);
  }

  Response::Error(ErrorType::GetAppFailed(ref_id, app_id))
}

#[cfg(windows)]
async fn write_download(file: &mut File, url: &str) -> Option<()> {
  let mut download = DOWNLOADER.get(url).send().await.ok()?;

  while let Some(chunk) = download.chunk().await.ok()? {
    file.write(&chunk).ok()?;
  }

  file.flush().ok()
}
