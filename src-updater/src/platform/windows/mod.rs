use std::{
  fs::{create_dir_all, remove_file},
  process::Command,
};

use crate::{Asset, Release};
use dirs::cache_dir;

use super::download;

pub async fn platform_update(raw: &Release, asset: &Asset) {
  let mut local = cache_dir().unwrap();
  local.push("Temp");

  let _ = create_dir_all(&local);

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

    cmd.spawn().unwrap();
  }
}
