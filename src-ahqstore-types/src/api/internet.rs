//! Unified API for all officially declared AHQ Store Parsable Repos
//!
//! Currently URL Declared AHQ Store Parsable Repos Officially Used are
//! - 🛍️ AHQ Store Official Community Repository (AHQStore)
//! - 🪟 Microsoft Winget Community Repository (WinGet)
//! - 🫓 Flathub Community Repository (FlatHub)
//! - 📱 FDroid Android Community Repository (FDroid)

use crate::AHQStoreApplication;

use super::{
  ahqstore::{
    AHQSTORE_APPS_DEV, AHQSTORE_APP_ASSET_URL, AHQSTORE_APP_URL, AHQSTORE_DEV_DATA, AHQSTORE_HOME,
    AHQSTORE_MAP, AHQSTORE_SEARCH, AHQSTORE_TOTAL,
  },
  flatpak,
  methods::{self, OfficialManifestSource, Store},
  winget::{
    WINGET_APPS_DEV, WINGET_APP_ASSET_URL, WINGET_APP_URL,
    WINGET_MAP, WINGET_SEARCH, WINGET_TOTAL,
  },
  SearchEntry,
};
use anyhow::{anyhow, Context, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Commits {
  pub ahqstore: String,
  pub winget: String,
}

#[tauri_macros::command]
pub async fn get_all_commits(token: Option<String>) -> Result<Commits> {
  let ahqstore = methods::get_commit(Store::AHQStore, token.as_ref()).await.context("http")?;
  let winget = methods::get_commit(Store::WinGet, token.as_ref()).await.context("http")?;

  Ok(Commits { ahqstore, winget })
}

#[tauri_macros::command]
pub async fn get_total_maps_by_source(
  source: OfficialManifestSource,
  commit: &str,
) -> Result<usize> {
  let total = match source {
    OfficialManifestSource::AHQStore => &*AHQSTORE_TOTAL,
    OfficialManifestSource::WinGet => &*WINGET_TOTAL,
    _ => {
      return Err(anyhow!("source not supported"));
    }
  };
  methods::get_total_maps(total, commit).await.context("")
}

#[tauri_macros::command]
pub async fn get_home(ahqstore_repo_commit: &str,) -> Result<Vec<(String, Vec<String>)>> {
  let home = &*AHQSTORE_HOME;

  methods::get_home(home, ahqstore_repo_commit).await.context("")
}

#[tauri_macros::command]
pub async fn get_search_by_source(
  source: OfficialManifestSource,
  commit: &str,
  id: &str,
) -> Result<Vec<super::SearchEntry>> {
  let search = match source {
    OfficialManifestSource::AHQStore => &*AHQSTORE_SEARCH,
    OfficialManifestSource::WinGet => &*WINGET_SEARCH,
    _ => {
      return Err(anyhow!(""));
    }
  };

  methods::get_search(search, commit, id).await.context("")
}

#[tauri_macros::command]
pub async fn get_all_maps_by_source(
  source: OfficialManifestSource,
  commit: &str,
) -> Result<super::MapData> {
  let (total, map) = match source {
    OfficialManifestSource::AHQStore => (&*AHQSTORE_TOTAL, &*AHQSTORE_MAP),
    OfficialManifestSource::WinGet => (&*WINGET_TOTAL, &*WINGET_MAP),
    _ => {
      return Err(anyhow!("source not supported"));
    }
  };

  let (total, map) = (total.as_str(), map.as_str());

  methods::get_full_map(total, map, commit).await.context("")
}

#[tauri_macros::command]
pub async fn get_all_search(
  commit: &Commits,
) -> Result<Vec<SearchEntry>> {
  let total = &*AHQSTORE_TOTAL;
  let search = &*AHQSTORE_SEARCH;

  let mut result: Vec<SearchEntry> = methods::get_full_search(total, search, &commit.ahqstore).await.context("")?;

  let total = &*WINGET_TOTAL;
  let search = &*WINGET_SEARCH;

  result.append(&mut methods::get_full_search(total, search, &commit.winget).await.context("")?);

  Ok(result)
}

pub type RespMapData = super::MapData;

#[tauri_macros::command]
pub async fn get_map_by_source(
  source: OfficialManifestSource,
  commit: &str,
  id: &str,
) -> Result<RespMapData> {
  let map = match source {
    OfficialManifestSource::AHQStore => &*AHQSTORE_MAP,
    OfficialManifestSource::WinGet => &*WINGET_MAP,
    _ => {
      return Err(anyhow!("source not supported"));
    }
  };

  methods::get_map(map, commit, id).await.context("")
}

#[tauri_macros::command]
pub async fn get_devs_apps_by_source(
  source: OfficialManifestSource,
  commit: &str,
  id: &str,
) -> Result<Vec<String>> {
  let apps_dev = match source {
    OfficialManifestSource::AHQStore => &*AHQSTORE_APPS_DEV,
    OfficialManifestSource::WinGet => &*WINGET_APPS_DEV,
    OfficialManifestSource::FlatHub => {
      todo!()
    }
    OfficialManifestSource::FDroid => {
      todo!()
    }
  };

  methods::get_devs_apps(apps_dev, commit, id).await.context("")
}

#[tauri_macros::command]
pub async fn get_dev_data_by_source(
  source: OfficialManifestSource,
  commit: &str,
  id: &str,
) -> Result<super::DevData> {
  let dev_data = match source {
    OfficialManifestSource::AHQStore => &*AHQSTORE_DEV_DATA,
    OfficialManifestSource::WinGet => {
      return Ok(super::DevData {
        name: "WinGet".into(),
        id: "winget".into(),
        github: "https://github.com/microsoft/winget-pkgs".into(),
        avatar_url: "https://github.com/microsoft/winget-cli/blob/master/.github/images/WindowsPackageManager_Assets/ICO/PNG/_64.png?raw=true".into(),
      });
    },
    OfficialManifestSource::FlatHub => {
      return Ok(super::DevData {
        name: "FlatHub".into(),
        id: "flathub".into(),
        github: "https://github.com/flathub".into(),
        avatar_url: "https://avatars.githubusercontent.com/u/27268838?s=200&v=4".into(),
      });
    }
    OfficialManifestSource::FDroid => {
      return Ok(super::DevData {
        name: "F-Droid".into(),
        id: "fdroid".into(),
        avatar_url: "https://avatars.githubusercontent.com/u/8239603?s=200&v=4".into(),
        github: "https://github.com/f-droid".into()
      })
    }
  };

  methods::get_dev_data(dev_data, commit, id).await.context("")
}

pub async fn get_app_asset(commit: &str, app_id: &str, asset: &str) -> Option<Vec<u8>> {
  if app_id.starts_with("flathub:") {
    return flatpak::get_app_asset(app_id, asset).await;
  }

  let app_asset_url = if app_id.starts_with("winget_app_") {
    &*WINGET_APP_ASSET_URL
  } else {
    &*AHQSTORE_APP_ASSET_URL
  };

  methods::get_app_asset(app_asset_url, commit, app_id, asset).await
}

#[tauri_macros::command]
pub async fn get_app(commit: &str, app_id: &str) -> Result<AHQStoreApplication> {
  if app_id.starts_with("flathub:") {
    return flatpak::get_app(app_id).await.context("");
  }

  let app_url = if app_id.starts_with("winget_app_") {
    &*WINGET_APP_URL
  } else {
    &*AHQSTORE_APP_URL
  };

  methods::get_app(app_url, commit, app_id).await.context("")
}