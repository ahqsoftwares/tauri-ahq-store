use crate::InstallMode;
use reqwest::blocking::{Client, ClientBuilder};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Release {
  pub prerelease: bool,
  pub tag_name: String,
  pub assets: Vec<Asset>,
}

#[derive(Serialize, Deserialize)]
struct Asset {
  pub name: String,
  pub browser_download_url: String,
}

#[derive(Default, Debug)]
pub struct ReleaseData {
  pub msi: String,
  pub service: String,
  pub deb: String,
  pub app_image: String,
}

pub fn fetch(install: &InstallMode) -> (Client, ReleaseData) {
  let client: Client = ClientBuilder::new()
    .user_agent("AHQ Store / Installer")
    .build()
    .unwrap();

  let pre = matches!(install, &InstallMode::InstallPR);

  let url = if pre {
    "https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases"
  } else {
    "https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases/latest"
  };

  let release = {
    if pre {
      let release = client
        .get(url)
        .send()
        .unwrap()
        .json::<Vec<Release>>()
        .unwrap();

      release.into_iter().find(|x| x.prerelease).unwrap()
    } else {
      client.get(url).send().unwrap().json::<Release>().unwrap()
    }
  };

  let mut data = ReleaseData::default();

  release.assets.into_iter().for_each(|x| {
    if x.name.ends_with(".msi") {
      data.msi = x.browser_download_url;
    } else if x.name.ends_with(".deb") {
      data.deb = x.browser_download_url;
    } else if x.name.ends_with(".AppImage") {
      data.app_image = x.browser_download_url;
    } else if &x.name == "ahqstore_service.exe" {
      data.service = x.browser_download_url;
    }
  });

  (client, data)
}
