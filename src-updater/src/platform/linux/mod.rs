use std::{fs::*, process::{self, Command}};

use crate::Release;
use dirs::home_dir;
use super::download;

pub async fn platform_update(raw: Release) {
  if let Some(asset) = raw.assets.iter().find(|x| &x.name == "ahqstore_setup_amd64_linux") {
    let mut local = home_dir().unwrap();

    let _ = create_dir_all(&local);

    local.push("ahqstore_updater");

    let file = local.to_str().unwrap_or("/updater");

    let _ = remove_file(&file);

    if let Some(()) = download(&asset.browser_download_url, file).await {
      Command::new("chmod")
        .arg("a+rwx")
        .arg(file)
        .spawn()
        .unwrap()
        .wait()
        .unwrap();

      let mut cmd = Command::new("nohup");
      
      cmd.arg(file);

      if raw.prerelease {
        cmd.arg("updatepr");
      } else {
        cmd.arg("update");
      }

      cmd.spawn()
        .unwrap();
    } else {
      process::exit(-5);
    }
  }
}