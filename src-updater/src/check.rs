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

pub async fn is_update_available(version: &str, pr_in: bool) -> (bool, Option<Release>) {
  if let Ok(resp) = CLIENT
    .get("https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases")
    .send()
    .await
  {
    if let Ok(resp) = resp.json::<Vec<Release>>().await {
      if let Some(release) = resp.into_iter().find(|x| x.prerelease == pr_in) {
        if &release.tag_name != version {
          return (true, Some(release));
        }
      }
    }
  }

  (false, None)
}

pub async fn update(release: Release) {
  platform_update(release).await;
}
