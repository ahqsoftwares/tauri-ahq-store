use crate::InstallMode;
use reqwest::{Client, ClientBuilder};
use std::env::consts::ARCH;
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
  pub linux_daemon: String,
  pub deb: String,
}

macro_rules! arch {
  ($x:expr, $y:expr) => {
    (ARCH == "x86_64" && $x) || (ARCH == "aarch64" && $y)
  };
}

pub async fn fetch(install: &InstallMode) -> (Client, ReleaseData) {
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
        .await
        .unwrap()
        .json::<Vec<Release>>()
        .await
        .unwrap();

      release.into_iter().find(|x| x.prerelease).unwrap()
    } else {
      client
        .get(url)
        .send()
        .await
        .unwrap()
        .json::<Release>()
        .await
        .unwrap()
    }
  };

  let mut data = ReleaseData::default();

  release.assets.into_iter().for_each(|x| {
    if arch!(x.name.ends_with("x64_en-US.msi"), x.name.ends_with("arm64_en-US.msi")) {
      data.msi = x.browser_download_url;
    } else if arch!(x.name.ends_with("amd64.deb"), x.name.ends_with("arm64.deb")) {
      data.deb = x.browser_download_url;
    } else if arch!(&x.name == "ahqstore_service_amd64.exe", &x.name == "ahqstore_service_arm64.exe") {
      data.service = x.browser_download_url;
    } else if arch!(&x.name == "ahqstore_service_amd64", &x.name == "ahqstore_service_arm64") {
      data.linux_daemon = x.browser_download_url;
    }
  });

  (client, data)
}
