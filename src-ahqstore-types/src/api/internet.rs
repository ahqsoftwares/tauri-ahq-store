use std::sync::LazyLock;

use reqwest::{Client, ClientBuilder};
use serde::{Deserialize, Serialize};

use crate::AHQStoreApplication;

static CLIENT: LazyLock<Client> = LazyLock::new(|| {
  ClientBuilder::new()
    .user_agent("AHQ Store / RUST / Official / AHQ Softwares")
    .build()
    .unwrap()
});

#[derive(Serialize, Deserialize)]
pub struct GHRepoCommit {
  pub sha: String,
}

pub static BASE_URL: &'static str = "https://rawcdn.githack.com/ahqstore/data/{COMMIT}";
pub static COMMIT_URL: &'static str = "https://api.github.com/repos/ahqstore/data/commits";

pub static APP_URL: LazyLock<String> =
  LazyLock::new(|| format!("{BASE_URL}/db/apps/{{APP_ID}}.json"));
pub static APP_ASSET_URL: LazyLock<String> =
  LazyLock::new(|| format!("{BASE_URL}/db/res/{{APP_ID}}/{{ASSET}}.json"));

pub static TOTAL: LazyLock<String> = LazyLock::new(|| format!("{BASE_URL}/db/total"));
pub static HOME: LazyLock<String> = LazyLock::new(|| format!("{BASE_URL}/db/home.json"));

pub static SEARCH: LazyLock<String> = LazyLock::new(|| format!("{BASE_URL}/db/search/{{ID}}.json"));
pub static MAP: LazyLock<String> = LazyLock::new(|| format!("{BASE_URL}/db/map/{{ID}}.json"));

pub type GHRepoCommits = Vec<GHRepoCommit>;

pub async fn get_commit(token: Option<String>) -> Option<String> {
  let mut builder = CLIENT.get(COMMIT_URL);

  if let Some(val) = token {
    builder = builder.bearer_auth(val);
  }

  let val = builder.send().await.ok()?;
  let val = val.json::<GHRepoCommits>().await.ok()?;
  let sha = val.remove(0).sha;

  Some(sha)
}

pub async fn get_app_asset(commit: &str, app_id: &str, asset: &str) {}

pub async fn get_app(commit: &str, app_id: &str, embed_assets: bool) -> AHQStoreApplication {

}
