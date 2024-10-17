use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::{
  AHQStoreApplication, AppRepo, DownloadUrl, InstallerFormat, InstallerOptions,
  InstallerOptionsLinux,
};

use super::CLIENT;

pub static FH_BASE_URL: &'static str = "https://flathub.org/api/v2";

pub static SEARCH: &'static str = "https://flathub.org/api/v2/search?locale=en";
pub static APP: &'static str = "https://flathub.org/api/v2/appstream/{{id}}";
pub static SUMMARY_ARCHES: &'static str = "https://flathub.org/api/v2/summary/{{id}}";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlatpakApplication {
  pub r#type: String,
  pub description: String,
  pub app_id: String,
  pub name: String,
  pub summary: String,
  pub developer_name: String,
  pub urls: Option<Urls>,
  pub project_license: Option<String>,
  pub icon: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Urls {
  pub homepage: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Summary {
  pub arches: Vec<String>,
}

async fn get_ft_app(id: &str) -> Option<FlatpakApplication> {
  CLIENT
    .get(APP.replace("{{id}}", &id))
    .send()
    .await
    .ok()?
    .json()
    .await
    .ok()
}

pub async fn get_app(id: &str) -> Option<AHQStoreApplication> {
  let app_id = id.replacen("flatpak:", "", 1);

  let app = get_ft_app(&app_id).await?;

  let Summary { arches } = CLIENT
    .get(SUMMARY_ARCHES.replace("{{id}}", &app_id))
    .send()
    .await
    .ok()?
    .json()
    .await
    .ok()?;

  let mut linux: Option<InstallerOptionsLinux> = None;

  #[allow(non_snake_case)]
  let mut linuxArm64: Option<InstallerOptionsLinux> = None;

  arches.into_iter().for_each(|s| {
    if &s == "aarch64" {
      linuxArm64 = InstallerOptionsLinux { assetId: 0 }.into();
    } else if &s == "x86_64" {
      linux = InstallerOptionsLinux { assetId: 0 }.into();
    }
  });

  Some(AHQStoreApplication {
    appDisplayName: app.name.clone(),
    appId: format!("flatpak:{}", app.app_id),
    appShortcutName: app.name,
    app_page: app.urls.clone().map_or_else(|| None, |x| x.homepage),
    authorId: format!("flathub:{}", app.developer_name),
    description: app.summary,
    displayImages: vec![],
    license_or_tos: app.project_license,
    releaseTagName: format!("flathub"),
    repo: AppRepo {
      author: "flathub".to_string(),
      repo: "flathub".to_string(),
    },
    site: app.urls.map_or_else(|| None, |x| x.homepage),
    version: format!("flatpak:latest"),
    source: Some(format!("Flatpak")),
    install: InstallerOptions {
      android: None,
      linuxArm7: None,
      win32: None,
      winarm: None,
      linux,
      linuxArm64,
    },
    downloadUrls: {
      let mut map = HashMap::new();

      map.insert(
        0,
        DownloadUrl {
          asset: "url".to_string(),
          installerType: InstallerFormat::LinuxFlathubFlatpak,
          url: "flatpak".into(),
        },
      );

      map
    },
    resources: None,
  })
}

pub async fn get_app_asset<T>(id: &str, _: T) -> Option<Vec<u8>> {
  let id = id.replacen("flatpak:", "", 1);
  let app = get_ft_app(&id).await?;

  CLIENT
    .get(app.icon)
    .send()
    .await
    .ok()?
    .bytes()
    .await
    .ok()?
    .to_vec()
    .into()
}