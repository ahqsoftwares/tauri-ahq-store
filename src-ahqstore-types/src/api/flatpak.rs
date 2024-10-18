use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::{
  AHQStoreApplication, AppRepo, DownloadUrl, InstallerFormat, InstallerOptions,
  InstallerOptionsLinux,
};

use super::{SearchEntry, CLIENT};

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
    authorId: format!("flathub"),
    description: app.summary,
    displayImages: vec![],
    license_or_tos: app.project_license,
    releaseTagName: format!("flathub"),
    repo: AppRepo {
      author: app.developer_name,
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
    verified: false
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

#[derive(Debug, Serialize, Deserialize)]
struct FlatpakSearchObject {
  pub query: String,
  pub filters: Vec<()>,
}

#[derive(Debug, Serialize, Deserialize)]
struct FlatpakSearchReturnObject {
  pub hits: Vec<FlatpakReturnedApplication>,
}

#[derive(Debug, Serialize, Deserialize)]
struct FlatpakReturnedApplication {
  pub name: String,
  pub app_id: String,
}

pub async fn search(query: &str) -> Option<Vec<SearchEntry>> {
  use serde_json::to_string;

  let FlatpakSearchReturnObject { mut hits } = CLIENT
    .post(SEARCH)
    .body(
      to_string(&FlatpakSearchObject {
        query: query.to_string(),
        filters: vec![],
      })
      .ok()?,
    )
    .send()
    .await
    .ok()?
    .json::<FlatpakSearchReturnObject>()
    .await
    .ok()?;

  hits.truncate(10);

  Some(
    hits
      .into_iter()
      .map(|x| SearchEntry {
        id: format!("flatpak:{}", x.app_id),
        name: x.name.clone(),
        title: x.name,
      })
      .collect::<Vec<_>>(),
  )
}
