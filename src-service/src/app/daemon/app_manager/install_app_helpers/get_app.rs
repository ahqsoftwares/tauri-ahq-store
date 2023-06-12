use reqwest::blocking::Client;

use crate::app::daemon::app_manager::{get_app, AppDownloaded};

#[allow(dead_code)]
pub fn get_apps_download_url(
    apps: Vec<String>,
    client: Client,
    commit_id: String,
) -> Vec<AppDownloaded> {
    let apps = get_app::get_apps(apps, client, commit_id);

    apps.iter()
        .map(|app| {
            let url = app.app.download_url.clone();
            let exec = app.app.exe.clone();
            let name = app.app.title.clone();
            let version = app.app.version.clone();

            AppDownloaded { url, exec, name, version }
        })
        .collect()
}
