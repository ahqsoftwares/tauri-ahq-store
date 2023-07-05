use std::{fs, os::windows::process::CommandExt, path::Path, process::Command};

use crate::app::daemon::app_manager::{get_root, APPS_FOLDER, INSTALLER_FOLDER};

pub fn deploy_zip(app_id: String, version: String) -> u8 {
    let zip_file = format!("{}{}\\{}.zip", get_root(), INSTALLER_FOLDER, &app_id);

    let install = format!("{}{}\\{}", get_root(), APPS_FOLDER, &app_id);
    let install_dir = Path::new(&install);

    fs::remove_dir_all(&install_dir).unwrap_or(());
    fs::create_dir_all(&install_dir).unwrap_or(());

    let updater_file = fs::write(format!("{}\\ahqStoreVersion", &install), version);

    let cmd = Command::new("powershell")
        .creation_flags(0x08000000)
        .args(["-NoProfile", "-WindowStyle", "Minimized"])
        .args([
            "Expand-Archive",
            format!("-Path \"{}\"", &zip_file).as_str(),
            format!("-DestinationPath \"{}\"", &install).as_str(),
            "-Force",
        ])
        .spawn();

    let cleanup = |err| {
        fs::remove_file(zip_file).unwrap_or(());

        if err {
            fs::remove_dir_all(&install_dir).unwrap_or(());
        }
    };

    if let Ok(_) = updater_file {
        if let Ok(mut child) = cmd {
            if let Ok(status) = child.wait() {
                if status.success() {
                    cleanup(false);
                    return 0;
                }
            }
        }
    }
    cleanup(true);
    return 1;
}
