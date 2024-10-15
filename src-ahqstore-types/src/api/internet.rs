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
    WINGET_APPS_DEV, WINGET_APP_ASSET_URL, WINGET_APP_URL, WINGET_DEV_DATA, WINGET_HOME,
    WINGET_MAP, WINGET_SEARCH, WINGET_TOTAL,
  },
  SearchEntry,
};

pub struct Commits {
  pub ahqstore: String,
  pub winget: String,
}

#[deprecated]
pub async fn get_commit(token: Option<String>) -> Option<String> {
  Some(get_all_commits(token).await?.ahqstore)
}

pub async fn get_all_commits(token: Option<String>) -> Option<Commits> {
  let ahqstore = methods::get_commit(Store::AHQStore, token.as_ref()).await?;
  let winget = methods::get_commit(Store::WinGet, token.as_ref()).await?;

  Some(Commits { ahqstore, winget })
}

#[deprecated]
pub async fn get_total_maps(commit: &str) -> Option<usize> {
  get_total_maps_by_source(OfficialManifestSource::AHQStore, commit).await
}

pub async fn get_total_maps_by_source(
  source: OfficialManifestSource,
  commit: &str,
) -> Option<usize> {
  let total = match source {
    OfficialManifestSource::AHQStore => &*AHQSTORE_TOTAL,
    OfficialManifestSource::WinGet => &*WINGET_TOTAL,
    _ => {
      return None;
    }
  };
  methods::get_total_maps(total, commit).await
}

#[deprecated]
pub async fn get_home(commit: &str) -> Option<Vec<(String, Vec<String>)>> {
  get_home_by_source(OfficialManifestSource::AHQStore, commit).await
}

pub async fn get_home_by_source(
  source: OfficialManifestSource,
  commit: &str,
) -> Option<Vec<(String, Vec<String>)>> {
  let home = match source {
    OfficialManifestSource::AHQStore => &*AHQSTORE_HOME,
    OfficialManifestSource::WinGet => &*WINGET_HOME,
    _ => {
      return None;
    }
  };

  methods::get_home(home, commit).await
}

#[deprecated]
pub async fn get_search(commit: &str, id: &str) -> Option<Vec<super::SearchEntry>> {
  get_search_by_source(OfficialManifestSource::AHQStore, commit, id).await
}

pub async fn get_search_by_source(
  source: OfficialManifestSource,
  commit: &str,
  id: &str,
) -> Option<Vec<super::SearchEntry>> {
  let search = match source {
    OfficialManifestSource::AHQStore => &*AHQSTORE_SEARCH,
    OfficialManifestSource::WinGet => &*WINGET_SEARCH,
    _ => {
      return None;
    }
  };

  methods::get_search(search, commit, id).await
}

pub async fn get_all_maps_by_source(
  source: OfficialManifestSource,
  commit: &str,
) -> Option<super::MapData> {
  let (total, map) = match source {
    OfficialManifestSource::AHQStore => (&*AHQSTORE_TOTAL, &*AHQSTORE_MAP),
    OfficialManifestSource::WinGet => (&*WINGET_TOTAL, &*WINGET_MAP),
    _ => {
      return None;
    }
  };

  let (total, map) = (total.as_str(), map.as_str());

  methods::get_full_map(total, map, commit).await
}

pub async fn get_all_search_by_source(
  source: OfficialManifestSource,
  commit: &str,
) -> Option<Vec<SearchEntry>> {
  let (total, search) = match source {
    OfficialManifestSource::AHQStore => (&*AHQSTORE_TOTAL, &*AHQSTORE_SEARCH),
    OfficialManifestSource::WinGet => (&*WINGET_TOTAL, &*WINGET_SEARCH),
    _ => {
      return None;
    }
  };

  let (total, search) = (total.as_str(), search.as_str());

  methods::get_full_search(total, search, commit).await
}

pub type RespMapData = super::MapData;

#[deprecated]
pub async fn get_map(commit: &str, id: &str) -> Option<RespMapData> {
  get_map_by_source(OfficialManifestSource::AHQStore, commit, id).await
}

pub async fn get_map_by_source(
  source: OfficialManifestSource,
  commit: &str,
  id: &str,
) -> Option<RespMapData> {
  let map = match source {
    OfficialManifestSource::AHQStore => &*AHQSTORE_MAP,
    OfficialManifestSource::WinGet => &*WINGET_MAP,
    _ => {
      return None;
    }
  };

  methods::get_map(map, commit, id).await
}

#[deprecated]
pub async fn get_devs_apps(commit: &str, id: &str) -> Option<Vec<String>> {
  get_devs_apps_by_source(OfficialManifestSource::AHQStore, commit, id).await
}

pub async fn get_devs_apps_by_source(
  source: OfficialManifestSource,
  commit: &str,
  id: &str,
) -> Option<Vec<String>> {
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

  methods::get_devs_apps(apps_dev, commit, id).await
}

#[deprecated]
pub async fn get_dev_data(commit: &str, id: &str) -> Option<super::DevData> {
  get_dev_data_by_source(OfficialManifestSource::AHQStore, commit, id).await
}

pub async fn get_dev_data_by_source(
  source: OfficialManifestSource,
  commit: &str,
  id: &str,
) -> Option<super::DevData> {
  let dev_data = match source {
    OfficialManifestSource::AHQStore => &*AHQSTORE_DEV_DATA,
    OfficialManifestSource::WinGet => &*WINGET_DEV_DATA,
    OfficialManifestSource::FlatHub => {
      return Some(super::DevData {
        name: "FlatHub".into(),
        id: "flathub".into(),
        github: "https://github.com/flathub".into(),
        avatar_url: "https://avatars.githubusercontent.com/u/27268838?s=200&v=4".into(),
      });
    }
    OfficialManifestSource::FDroid => {
      return Some(super::DevData {
        name: "F-Droid".into(),
        id: "fdroid".into(),
        avatar_url: "https://avatars.githubusercontent.com/u/8239603?s=200&v=4".into(),
        github: "https://github.com/f-droid".into()
      })
    }
  };

  methods::get_dev_data(dev_data, commit, id).await
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

pub async fn get_app(commit: &str, app_id: &str) -> Option<AHQStoreApplication> {
  if app_id.starts_with("flathub:") {
    return flatpak::get_app(app_id).await;
  }

  let app_url = if app_id.starts_with("winget_app_") {
    &*WINGET_APP_URL
  } else {
    &*AHQSTORE_APP_URL
  };

  methods::get_app(app_url, commit, app_id).await
}