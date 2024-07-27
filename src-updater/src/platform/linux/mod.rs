use std::{
  fs::*,
  process::{self, Command},
};

use super::download;
use crate::{Asset, Release};
use dirs::home_dir;

pub async fn platform_update(raw: &Release, asset: &Asset) {
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

    cmd.spawn().unwrap();
  } else {
    process::exit(-5);
  }
}
