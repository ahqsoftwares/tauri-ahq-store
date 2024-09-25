#[cfg(feature = "js")]
use wasm_bindgen::{JsValue, prelude::wasm_bindgen};

use std::sync::LazyLock;

use reqwest::{Client, ClientBuilder};
use serde::{Deserialize, Serialize};

use crate::AHQStoreApplication;

pub static CLIENT: LazyLock<Client> = LazyLock::new(|| {
  ClientBuilder::new()
    .user_agent("AHQ Store Types / Rust / AHQ Softwares")
    .build()
    .unwrap()
});

#[derive(Serialize, Deserialize)]
#[cfg_attr(feature = "js", wasm_bindgen(getter_with_clone))]
pub struct GHRepoCommit {
  pub sha: String,
}

pub static BASE_URL: &'static str = "https://rawcdn.githack.com/ahqstore/apps/{COMMIT}";
pub static COMMIT_URL: &'static str = "https://api.github.com/repos/ahqstore/apps/commits";

pub static APP_URL: LazyLock<String> =
  LazyLock::new(|| format!("{BASE_URL}/db/apps/{{APP_ID}}.json"));
pub static APP_ASSET_URL: LazyLock<String> =
  LazyLock::new(|| format!("{BASE_URL}/db/res/{{APP_ID}}/{{ASSET}}.json"));

pub static TOTAL: LazyLock<String> = LazyLock::new(|| format!("{BASE_URL}/db/total"));
pub static HOME: LazyLock<String> = LazyLock::new(|| format!("{BASE_URL}/db/home.json"));

pub static SEARCH: LazyLock<String> = LazyLock::new(|| format!("{BASE_URL}/db/search/{{ID}}.json"));
pub static MAP: LazyLock<String> = LazyLock::new(|| format!("{BASE_URL}/db/map/{{ID}}.json"));

pub static APPS_DEV: LazyLock<String> = LazyLock::new(|| format!("{BASE_URL}/db/dev/{{ID}}.json"));
pub static DEV_DATA: LazyLock<String> = LazyLock::new(|| format!("{BASE_URL}/users/{{ID}}.json"));

pub type GHRepoCommits = Vec<GHRepoCommit>;

#[cfg_attr(feature = "js", wasm_bindgen)]
pub async fn get_commit(token: Option<String>) -> Option<String> {
  let mut builder = CLIENT.get(COMMIT_URL);

  if let Some(val) = token {
    builder = builder.bearer_auth(val);
  }

  let val = builder.send().await.ok()?;
  let mut val = val.json::<GHRepoCommits>().await.ok()?;
  let sha = val.remove(0).sha;

  Some(sha)
}

#[cfg_attr(feature = "js", wasm_bindgen)]
pub async fn get_total_maps(commit: &str) -> Option<usize> {
  CLIENT
    .get(TOTAL.replace("{COMMIT}", commit))
    .send()
    .await
    .ok()?
    .json()
    .await
    .ok()
}

#[cfg_attr(feature = "js", wasm_bindgen)]
pub async fn get_search(commit: &str, id: &str) -> Option<Vec<super::SearchEntry>> {
  CLIENT
    .get(SEARCH.replace("{COMMIT}", commit).replace("{ID}", id))
    .send()
    .await
    .ok()?
    .json()
    .await
    .ok()
}

#[cfg(not(feature = "js"))]
pub type RespMapData = super::MapData;
#[cfg(feature = "js")]
pub type RespMapData = JsValue;

#[cfg_attr(feature = "js", wasm_bindgen)]
pub async fn get_map(commit: &str, id: &str) -> Option<RespMapData> {
  let val: super::MapData = CLIENT
    .get(MAP.replace("{COMMIT}", commit).replace("{ID}", id))
    .send()
    .await
    .ok()?
    .json()
    .await
    .ok()?;

  #[cfg(feature = "js")]
  return serde_wasm_bindgen::to_value(&val).ok();

  #[cfg(not(feature = "js"))]
  return Some(val);
}

#[cfg_attr(feature = "js", wasm_bindgen)]
pub async fn get_devs_apps(commit: &str, id: &str) -> Option<Vec<String>> {
  let data: String = CLIENT
    .get(APPS_DEV.replace("{COMMIT}", commit).replace("{ID}", id))
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

#[cfg_attr(feature = "js", wasm_bindgen)]
pub async fn get_dev_data(commit: &str, id: &str) -> Option<super::DevData> {
  CLIENT
    .get(DEV_DATA.replace("{COMMIT}", commit).replace("{ID}", id))
    .send()
    .await
    .ok()?
    .json()
    .await
    .ok()
}

#[cfg_attr(feature = "js", wasm_bindgen)]
pub async fn get_app_asset(commit: &str, app_id: &str, asset: &str) -> Option<Vec<u8>> {
  let path = APP_ASSET_URL
    .replace("{COMMIT}", commit)
    .replace("{APP_ID}", app_id)
    .replace("{ASSET}", asset);

  let builder = CLIENT.get(&path).send().await.ok()?;

  Some(builder.bytes().await.ok()?.to_vec())
}

#[cfg_attr(feature = "js", wasm_bindgen)]
pub async fn get_app(commit: &str, app_id: &str) -> Option<AHQStoreApplication> {
  let url = APP_URL
    .replace("{COMMIT}", commit)
    .replace("{APP_ID}", app_id);

  let builder = CLIENT.get(url).send().await.ok()?;

  builder.json().await.ok()
}
