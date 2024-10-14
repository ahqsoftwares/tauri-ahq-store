use std::collections::HashMap;

#[cfg(feature = "js")]
use wasm_bindgen::prelude::wasm_bindgen;

use serde::{Deserialize, Serialize};

use crate::AHQStoreApplication;

use super::{ahqstore::AHQSTORE_COMMIT_URL, winget::WINGET_COMMIT_URL, CLIENT};

#[derive(Serialize, Deserialize)]
#[cfg_attr(feature = "js", wasm_bindgen(getter_with_clone))]
pub struct GHRepoCommit {
  pub sha: String,
}

pub enum OfficialManifestSource {
  AHQStore,
  WinGet
}

pub type Store = OfficialManifestSource;

pub type GHRepoCommits = Vec<GHRepoCommit>;

pub async fn get_commit(store: OfficialManifestSource, token: Option<&String>) -> Option<String> {
  let mut builder = CLIENT.get(match store {
    OfficialManifestSource::AHQStore => AHQSTORE_COMMIT_URL,
    OfficialManifestSource::WinGet => WINGET_COMMIT_URL
  });

  if let Some(val) = token {
    builder = builder.bearer_auth(val);
  }

  let val = builder.send().await.ok()?;
  let mut val = val.json::<GHRepoCommits>().await.ok()?;
  let sha = val.remove(0).sha;

  Some(sha)
}

pub async fn get_total_maps(total: &str, commit: &str) -> Option<usize> {
  CLIENT
    .get(total.replace("{COMMIT}", commit))
    .send()
    .await
    .ok()?
    .json()
    .await
    .ok()
}

pub async fn get_home(home: &str, commit: &str) -> Option<Vec<(String, Vec<String>)>> {
  CLIENT
    .get(home.replace("{COMMIT}", commit))
    .send()
    .await
    .ok()?
    .json()
    .await
    .ok()
}

pub async fn get_search(search: &str, commit: &str, id: &str) -> Option<Vec<super::SearchEntry>> {
  CLIENT
    .get(search.replace("{COMMIT}", commit).replace("{ID}", id))
    .send()
    .await
    .ok()?
    .json()
    .await
    .ok()
}

pub async fn get_full_map(total: &str, map: &str, commit: &str) -> Option<super::MapData> {
  let total = get_total_maps(total, commit).await?;

  let mut result = HashMap::new();

  let mut i = 1;
  while i <= total {
    let map_result = get_map(map, commit, &i.to_string()).await?;
    
    for (k, v) in map_result {
      result.insert(k, v);
    }

    i += 1;
  }

  Some(result)
}

pub async fn get_full_search(total: &str, search: &str, commit: &str) -> Option<Vec<super::SearchEntry>> {
  let total = get_total_maps(total, commit).await?;

  let mut result = vec![];

  let mut i = 1;
  while i <= total {
    let mut search_result = get_search(search, commit, &i.to_string()).await?;
    result.append(&mut search_result);
    i += 1;
  }

  Some(result)
}

pub type RespMapData = super::MapData;

pub async fn get_map(map: &str, commit: &str, id: &str) -> Option<RespMapData> {
  let val: super::MapData = CLIENT
    .get(map.replace("{COMMIT}", commit).replace("{ID}", id))
    .send()
    .await
    .ok()?
    .json()
    .await
    .ok()?;

  return Some(val);
}

pub async fn get_devs_apps(apps_dev: &str, commit: &str, id: &str) -> Option<Vec<String>> {
  let data: String = CLIENT
    .get(apps_dev.replace("{COMMIT}", commit).replace("{ID}", id))
    .send()
    .await
    .ok()?
    .json()
    .await
    .ok()?;

  Some(
    data
      .split("\n")
      .into_iter()
      .filter(|x| x.trim() != "")
      .map(|x| x.to_string())
      .collect(),
  )
}

pub async fn get_dev_data(dev_data: &str, commit: &str, id: &str) -> Option<super::DevData> {
  CLIENT
    .get(dev_data.replace("{COMMIT}", commit).replace("{ID}", id))
    .send()
    .await
    .ok()?
    .json()
    .await
    .ok()
}

pub async fn get_app_asset(app_asset_url: &str, commit: &str, app_id: &str, asset: &str) -> Option<Vec<u8>> {
  let path = app_asset_url
    .replace("{COMMIT}", commit)
    .replace("{APP_ID}", app_id)
    .replace("{ASSET}", asset);

  let builder = CLIENT.get(&path).send().await.ok()?;

  Some(builder.bytes().await.ok()?.to_vec())
}

pub async fn get_app(app_url: &str, commit: &str, app_id: &str) -> Option<AHQStoreApplication> {
  let url = app_url
    .replace("{COMMIT}", commit)
    .replace("{APP_ID}", app_id);

  let builder = CLIENT.get(url).send().await.ok()?;

  builder.json().await.ok()
}
