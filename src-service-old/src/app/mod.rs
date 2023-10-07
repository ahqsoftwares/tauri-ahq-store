use reqwest::blocking::Client;

pub mod daemon;

pub use daemon::{
  get_apps, get_commit_id, get_update_stats, install_apps, list_apps, post_preferences,
  preferences, run_update, set_sender, uninstall_apps,
};

#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct Commit {
  sha: String,
}

pub fn init() {
  let client = Client::new();

  daemon::start(client.clone());
}

pub fn stop() {
  daemon::stop();
}
