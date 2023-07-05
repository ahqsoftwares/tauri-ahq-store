use reqwest::blocking::Client;

use super::install_app_helpers::{get_apps_download_url, uninstall_app};

pub fn uninstall(apps: Vec<String>, commit_id: String, client: Client) -> Vec<String> {
    let mut payload = vec![];
    let urls = get_apps_download_url(apps.clone(), client.clone(), commit_id.clone());

    let mut i = 0;
    for url in urls {
        let id = &apps[i];

        match uninstall_app(id, url) {
            1 => payload.push(id.into()),
            _ => {}
        }

        i += 1;
    }

    payload
}
