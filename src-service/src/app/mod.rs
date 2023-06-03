use std::{thread, time::Duration};

use crate::db::set;
use reqwest::blocking::Client;

mod daemon;

static APPS_REPO: &str = "https://api.github.com/repos/ahqsoftwares/ahq-store-data";

#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct Commit {
    sha: String,
}

pub fn init() {
    let client = Client::new();

    let data = client
        .get(format!("{}/commits", APPS_REPO))
        .header("User-Agent", "AHQ Store Service, Windows x86_64")
        .timeout(Duration::from_secs(60))
        .send();

    match data {
        Ok(resp) => {
            if let Ok(json) = resp.json::<Vec<Commit>>() {
                let sha = (&json.first().unwrap().sha).clone();

                set(String::from("commit_id"), sha);
            } else {
                thread::sleep(Duration::from_secs(5 * 60));
                init();
            }
        }
        _ => {
            thread::sleep(Duration::from_secs(5 * 60));
            init();
        }
    }

    daemon::start(client.clone());
}

pub fn stop() {
    daemon::stop();
}
