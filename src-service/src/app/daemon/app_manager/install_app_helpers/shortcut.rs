use std::fs;

use crate::app::daemon::app_manager::{get_root, AppDownloaded, APPS_FOLDER, DESKTOP_FOLDER, START_FOLDER};
use mslnk::ShellLink;

pub fn shortcut(app_id: String, app: AppDownloaded) -> u8 {
    let target = format!(
        "{}{}/{}/{}",
        get_root(),
        APPS_FOLDER,
        &app_id,
        &app.exec
    );

    shortcut_cleanup(app.clone());

    let link_target = format!("{}{}", get_root(), DESKTOP_FOLDER.replace("[app]", &app.name));
    let start_menu = format!("{}{}", get_root(), START_FOLDER.replace("[app]", &app.name));

    fs::remove_file(&link_target).unwrap_or(());

    if let Ok(link) = &mut ShellLink::new(&target) {
        if let (Ok(_), Ok(_)) = (link.create_lnk(link_target), link.create_lnk(start_menu)) {
            return 0;
        } else {
            return 1;
        }
    } else {
        return 1;
    }
}

pub fn shortcut_cleanup(app: AppDownloaded) {
    let link_target = format!("{}{}", get_root(), DESKTOP_FOLDER.replace("[app]", &app.name));
    let start_menu = format!("{}{}", get_root(), START_FOLDER.replace("[app]", &app.name));

    fs::remove_file(link_target).unwrap_or(());
    fs::remove_file(start_menu).unwrap_or(());
}
