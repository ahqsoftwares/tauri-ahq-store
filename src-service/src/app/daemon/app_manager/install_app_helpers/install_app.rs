use std::{fs, thread::spawn};

use super::{deploy_zip, downloader, shortcut};
use crate::app::daemon::app_manager::{get_root, AppDownloaded, INSTALLER_FOLDER};

#[allow(dead_code)]
pub fn install_app(app: AppDownloaded, app_id: String) -> u8 {
    let folder = format!("{}{}", get_root(), INSTALLER_FOLDER);

    let id = app_id.clone();
    let fldr = folder.clone();

    let url = app.clone().url;
    let mut status =
        spawn(move || downloader::download(url, fldr, format!("{}.zip", &id), |_, _| {}))
            .join()
            .unwrap_or(1);

    if &status == &0 {
        status = deploy_zip(app_id.clone(), app.clone().version);
    }

    if &status == &0 {
        status = shortcut(app_id.clone(), app.clone());
    }

    fs::remove_file(format!("{}/{}.zip", folder.clone(), app_id.clone())).unwrap_or(());

    status
}
