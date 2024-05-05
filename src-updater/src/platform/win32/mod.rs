use std::{fs::remove_file, process::Command};

use crate::Release;
use dirs::cache_dir;
use super::download;

pub async fn platform_update(raw: Release) {
  if let Some(asset) = raw.assets.iter().find(|x| x.name.ends_with(".exe") && x.name.contains("setup")) {
    let mut local = cache_dir().unwrap();
    local.push("Temp");
    local.push("ahqstore_updater.exe");

    let file = local.to_str().unwrap_or("C:\\updater.exe");

    let _ = remove_file(&file);

    if let Some(()) = download(&asset.browser_download_url, file).await {
      let mut cmd = Command::new("powershell");
      
      cmd.arg("Start-Process");
      cmd.arg(file);

      if raw.prerelease {
        cmd.arg("updatepr");
      } else {
        cmd.arg("update");
      }

      cmd.spawn()
        .unwrap();
    }
  }
}
