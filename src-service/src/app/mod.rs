use reqwest::blocking::Client;

pub mod daemon;

pub use daemon::{set_sender, get_apps, get_update_stats, install_apps, list_apps, run_update};

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
