use std::{
  fs::{self, File},
  io::Write,
  process,
};

use lazy_static::lazy_static;
use progress_bar::*;
use reqwest::{
  blocking::{Client, ClientBuilder},
  header::{HeaderMap, HeaderValue},
};
use serde::{Deserialize, Serialize};

use crate::chalk::*;

#[derive(Serialize, Deserialize)]
struct Asset {
  pub name: String,
  pub browser_download_url: String,
}

#[derive(Serialize, Deserialize)]
struct Release {
  assets: Vec<Asset>,
}

lazy_static! {
  static ref CLIENT: Client = ClientBuilder::default()
    .default_headers({
      let mut headermap = HeaderMap::default();

      headermap.insert(
        "User-Agent",
        HeaderValue::from_static("AHQ Store Service / Installer"),
      );

      headermap
    })
    .build()
    .unwrap();
  pub static ref SERVICE_PATH: String = format!(
    "{}\\ProgramData\\AHQ Store Applications\\ahqstore_service.exe",
    std::env::var("SystemDrive").unwrap()
  );
}

fn get_release() -> Option<Release> {
  CLIENT
    .get("https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases/latest")
    .send()
    .ok()?
    .json()
    .ok()?
}

pub fn download_release(verbose: bool) {
  if let Some(Release { assets }) = get_release() {
    if let Some(Asset {
      browser_download_url,
      ..
    }) = assets
      .into_iter()
      .find(|asset| &asset.name == "ahqstore_service.exe")
    {
      if verbose {
        info(&format!("Downloading {}", &browser_download_url));
      }

      let fetch = || {
        let _ = fs::remove_file(SERVICE_PATH.as_str());

        let mut service = File::create(SERVICE_PATH.as_str()).ok()?;

        let resp = CLIENT.get(browser_download_url).send().ok()?;
        let bytes = resp.bytes().ok()?;

        let total = bytes.len();
        init_progress_bar(total);

        let mut current: usize = 0;
        for chunk in bytes.chunks(200) {
          current += chunk.len();
          service.write(chunk).ok()?;

          set_progress_bar_progress(current);
        }

        service.flush().ok()?;

        finalize_progress_bar();

        Some(())
      };

      if fetch().is_none() {
        error("Failed to download");
        process::exit(1);
      }
    }
  } else {
    error("Failed to get release");
    process::exit(1);
  }
}
