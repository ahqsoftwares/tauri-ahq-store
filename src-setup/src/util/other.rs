use serde::{Deserialize, Serialize};
use std::{
  fs::{self, create_dir_all},
  os::windows::process::CommandExt,
  process::Command,
};

use lazy_static::lazy_static;
use reqwest::{
  header::{HeaderMap, HeaderValue},
  Client, ClientBuilder,
};

use crate::shell;

pub static ROOT: &str = "{root}\\ProgramData\\AHQ Store Applications";

pub static PROGRAMS: &str = "{root}\\ProgramData\\AHQ Store Applications\\Programs";
pub static UPDATERS: &str = "{root}\\ProgramData\\AHQ Store Applications\\Updaters";
pub static INSTALLERS: &str = "{root}\\ProgramData\\AHQ Store Applications\\Installers";

lazy_static! {
  static ref CLIENT: Client = ClientBuilder::new()
    .default_headers({
      let mut map = HeaderMap::new();

      map.insert(
        "user-agent",
        HeaderValue::from_bytes(b"AHQ Store Installer").unwrap(),
      );

      map
    })
    .build()
    .unwrap();
  static ref EXPECTED_FILE_PATH: String = format!(
    "{}\\installer.msi",
    INSTALLERS.replace("{root}", &system_drive())
  );
  static ref EXPECTED_SERVICE_PATH: String = format!(
    "{}\\ahqstore_service.exe",
    ROOT.replace("{root}", &system_drive())
  );
}

pub fn system_drive() -> String {
  std::env::var("SystemDrive").unwrap()
}

pub fn mk_dir() {
  let sys = system_drive();

  let _ = (
    create_dir_all(&PROGRAMS.replace("{root}", &sys)),
    create_dir_all(&UPDATERS.replace("{root}", &sys)),
    create_dir_all(&INSTALLERS.replace("{root}", &sys)),
  );
}

pub fn install_msi() {
  shell::launch(
    &[
      "start-process",
      "-FilePath",
      &format!("\"{}\"", &*EXPECTED_FILE_PATH),
      "-Wait",
      "-ArgumentList",
      "/quiet, /passive",
    ],
    None,
  );
}

pub fn install_service() {
  Command::new("sc.exe")
    .creation_flags(0x08000000)
    .args([
      "create",
      "AHQ Store Service",
      "start=",
      "auto",
      "binpath=",
      &*EXPECTED_SERVICE_PATH,
    ])
    .spawn()
    .unwrap()
    .wait()
    .unwrap();

  Command::new("sc.exe")
    .creation_flags(0x08000000)
    .args(["start", "AHQ Store Service"])
    .spawn()
    .unwrap()
    .wait()
    .unwrap();
}

#[derive(Serialize, Deserialize)]
struct Asset {
  pub name: String,
  pub browser_download_url: String,
}

#[derive(Serialize, Deserialize)]
struct Release {
  pub assets: Vec<Asset>,
}

pub async fn download_bins() -> () {
  let url: String =
    "https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases/latest".into();

  let release = CLIENT
    .get(&url)
    .send()
    .await
    .unwrap()
    .json::<Release>()
    .await
    .unwrap();

  let releases: Vec<Asset> = release
    .assets
    .into_iter()
    .filter(|asset| asset.name.ends_with(".msi") || asset.name == "ahqstore_service.exe")
    .collect();

  for asset in releases {
    let is_msi = asset.name.ends_with(".msi");

    let req = CLIENT
      .get(&asset.browser_download_url)
      .send()
      .await
      .unwrap();

    let bytes = req.bytes().await.unwrap().to_vec();

    fs::write(
      if is_msi {
        &*EXPECTED_FILE_PATH
      } else {
        let res = Command::new("sc.exe")
          .creation_flags(0x08000000)
          .args(["stop", "AHQ Store Service"])
          .spawn()
          .unwrap()
          .wait();

        drop(res);

        let res = Command::new("sc.exe")
          .creation_flags(0x08000000)
          .args(["delete", "AHQ Store Service"])
          .spawn()
          .unwrap()
          .wait();

        drop(res);
        &*EXPECTED_SERVICE_PATH
      },
      bytes,
    )
    .unwrap();
  }
}
