use reqwest::blocking::Client;

use super::install_app_helpers::{get_apps_download_url, install_app};

pub fn install_apps(apps: Vec<String>, commit_id: String, client: Client) -> Vec<String> {
    let download_urls = get_apps_download_url(apps.clone(), client.clone(), commit_id.clone());

    let mut unsuccessful = vec![];

    let mut index = 0;
    for app in apps {
        let url = &download_urls[index];

        match install_app(url.clone(), app.clone()) {
            1 => {
                unsuccessful.push(app.clone());
            }
            _ => {}
        }
        index += 1;
    }

    unsuccessful
}
