use std::fs::{remove_dir_all, remove_file};

use crate::app::daemon::app_manager::{
    get_root, AppDownloaded, APPS_FOLDER, DESKTOP_FOLDER, START_FOLDER,
};

pub fn uninstall_app(app_id: &String, app: AppDownloaded) -> u8 {
    let link_target = format!(
        "{}{}",
        get_root(),
        DESKTOP_FOLDER.replace("[app]", &app.name)
    );
    let start_menu = format!("{}{}", get_root(), START_FOLDER.replace("[app]", &app.name));

    remove_file(&link_target).unwrap_or(());
    remove_file(&start_menu).unwrap_or(());

    let folder = format!("{}{}\\{}", get_root(), APPS_FOLDER, app_id);

    match remove_dir_all(folder) {
        Ok(_) => 0,
        _ => 1,
    }
}
