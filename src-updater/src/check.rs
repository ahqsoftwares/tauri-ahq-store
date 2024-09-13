use std::env::consts::{ARCH, OS};

use serde::{Deserialize, Serialize};

use crate::platform::{platform_update, CLIENT};

#[derive(Serialize, Deserialize)]
pub struct Asset {
  pub browser_download_url: String,
  pub name: String,
}

#[derive(Serialize, Deserialize)]
pub struct Release {
  pub tag_name: String,
  pub prerelease: bool,
  pub assets: Vec<Asset>,
}

pub fn gen_asset_name() -> (String, String) {
  let mut installer = String::from("ahqstore_setup");
  let mut service = String::from("ahqstore_service");

  if OS == "linux" {
    if ARCH == "x86_64" {
      service.push_str("_amd64");
      installer.push_str("_linux_amd64");
    } else if ARCH == "aarch64" {
      service.push_str("_arm64");
      installer.push_str("_linux_arm64");
    }
  } else if OS == "windows" {
    if ARCH == "x86_64" {
      service.push_str("_amd64.exe");
      installer.push_str("_win32_amd64");
    } else if ARCH == "aarch64" {
      service.push_str("_arm64.exe");
      installer.push_str("_win32_arm64");
    }
  }

  (installer, service)
}

pub async fn is_update_available(version: &str, pr_in: bool) -> (bool, Option<Release>) {
  if let Ok(resp) = CLIENT
    .get("https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases")
    .send()
    .await
  {
    if let Ok(resp) = resp.json::<Vec<Release>>().await {
      if let Some(release) = resp.into_iter().find(|x| x.prerelease == pr_in) {
        let (setup, service) = gen_asset_name();

        let setup = release.assets.iter().find(|x| &&x.name == &&setup);
        let service = release.assets.iter().find(|x| &&x.name == &&service);

        if &release.tag_name != version && setup.is_some() && service.is_some() {
          return (true, Some(release));
        }
      }
    }
  }

  (false, None)
}

pub async fn update(release: Release) {
  let (setup, _) = gen_asset_name();

  let setup = release.assets.iter().find(|x| &&x.name == &&setup).unwrap();
  platform_update(&release, setup).await;
}
