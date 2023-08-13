use std::{
    fs,
    sync::mpsc::Sender,
    thread::spawn,
    time::{Duration, SystemTime, UNIX_EPOCH},
    u128,
};

use super::{deploy_zip, downloader, shortcut};
use crate::app::daemon::app_manager::{get_root, AppDownloaded, INSTALLER_FOLDER};

static mut TX: Option<Sender<String>> = None;
static mut REF: Option<String> = None;
static mut LAST_SENT: u128 = 0;

#[allow(dead_code)]
pub fn install_app(
    app: AppDownloaded,
    app_id: String,
    tx: &&Sender<String>,
    ref_id: &&String,
) -> u8 {
    unsafe {
        TX = Some(tx.to_owned().to_owned());
        REF = Some(ref_id.to_string());
    }

    let folder = format!("{}{}", get_root(), INSTALLER_FOLDER);

    let id = app_id.clone();
    let fldr = folder.clone();

    let url = app.clone().url;
    let mut status = spawn(move || {
        downloader::download(url, fldr, format!("{}.zip", &id), |c, t| {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or(Duration::from_millis(1))
                .as_millis();

            unsafe {
                if now - LAST_SENT > 1000 {
                    LAST_SENT = now;
                    let sep = "ā";

                    if let Some(tx) = &TX.as_mut() {
                        tx.send(format!(
                            "INSTALLAPP{}{}{}{}of{}",
                            &sep,
                            REF.as_mut().unwrap(),
                            &sep,
                            c,
                            t
                        ))
                        .unwrap_or(());
                    }
                }
            }
        })
    })
    .join()
    .unwrap_or(8);

    unsafe {
        let sep = "ā";

        if let Some(tx) = &TX.as_mut() {
            tx.send(format!(
                "INSTALLAPP{}{}{}{}",
                &sep,
                REF.as_mut().unwrap(),
                &sep,
                format!("DOWNLOAD STATUS: {}", &status)
            ))
            .unwrap_or(());
        }
    }

    if &status == &0 {
        status = deploy_zip(app_id.clone(), app.clone().version);
    }

    if &status == &0 {
        status = shortcut(app_id.clone(), app.clone());
    }

    fs::remove_file(format!("{}/{}.zip", folder.clone(), app_id.clone())).unwrap_or(());

    status
}
