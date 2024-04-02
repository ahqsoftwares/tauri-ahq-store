use reqwest::blocking::{Client, ClientBuilder};

use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
lazy_static! {
  static ref CLIENT: Client = ClientBuilder::new()
    .user_agent("AHQ Store TYPES CRATE / LIB / RUST")
    .build()
    .unwrap();
}

#[derive(Serialize, Deserialize)]
pub struct GHRepoCommit {
  pub sha: String,
}

pub type GHRepoCommits = Vec<GHRepoCommit>;

static mut COMMIT_ID: Option<String> = None;

pub fn update_commit(token: Option<String>) -> Option<()> {
  let mut builder = CLIENT.get("https://api.github.com/repos/ahqstore/apps/commits/master");

  if let Some(val) = token {
    builder = builder.bearer_auth(val);
  }

  let val = builder.send().ok()?;
  let val = val.json::<GHRepoCommits>().ok()?;
  let val = &val[0];

  unsafe {
    COMMIT_ID = Some(val.sha.clone());
  }

  Some(())
}
