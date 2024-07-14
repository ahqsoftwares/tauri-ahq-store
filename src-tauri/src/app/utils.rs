use std::process::{Command, Stdio};

#[cfg(windows)]
use std::os::windows::process::CommandExt;

use lazy_static::lazy_static;
use reqwest::{
  blocking::{Client, ClientBuilder},
  header::{HeaderMap, HeaderValue},
};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct GhRelease {
  pub prerelease: bool,
  pub assets: Vec<GHAsset>,
}

#[derive(Serialize, Deserialize)]
struct GHAsset {
  pub name: String,
  pub browser_download_url: String,
}

lazy_static! {
  pub static ref CLIENT: Client = {
    let mut map = HeaderMap::new();
    map.insert(
      "User-Agent",
      HeaderValue::from_str("AHQ Store/Service Installer").unwrap(),
    );

    ClientBuilder::new().default_headers(map).build().unwrap()
  };
}

pub fn get_service_url(pr: bool) -> String {
  let mut get = CLIENT
    .get("https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases")
    .send()
    .unwrap()
    .json::<Vec<GhRelease>>()
    .unwrap();

  let get = if pr {
    get.swap_remove(0)
  } else {
    get.into_iter().find(|x| x.prerelease == false).unwrap()
  };

  for asset in get.assets {
    if (cfg!(unix) && &asset.name == "ahqstore_setup_amd64_linux")
      || (cfg!(windows) && &asset.name == "ahqstore_setup_win32_amd64.exe")
    {
      return asset.browser_download_url;
    }
  }

  panic!("Asset not found");
}

#[tauri::command(async)]
pub fn is_an_admin() -> bool {
  get_whoami().map_or_else(|| false, |x| get_localgroup(&x).unwrap_or(false))
}

#[cfg(unix)]
fn get_whoami() -> Option<String> {
  let mut whoami = None;

  let command = Command::new("whomai").stdout(Stdio::piped()).spawn();

  if let Ok(child) = command {
    if let Ok(status) = child.wait_with_output() {
      let output = String::from_utf8_lossy(&status.stdout);

      whoami = Some(output.trim().into());
    }
  }

  whoami
}

#[cfg(windows)]
fn get_whoami() -> Option<String> {
  let mut whoami = None;

  let command = Command::new("powershell")
    .args(["whoami"])
    .creation_flags(0x08000000)
    .stdout(Stdio::piped())
    .spawn();

  if let Ok(child) = command {
    if let Ok(status) = child.wait_with_output() {
      let output = String::from_utf8_lossy(&status.stdout);
      let new_whoami = output.split("\\").collect::<Vec<&str>>()[1]
        .trim()
        .to_string();

      whoami = Some(new_whoami);
    }
  }

  whoami
}

#[cfg(unix)]
fn get_localgroup(user: &String) -> Option<bool> {
  return None;
}

#[cfg(windows)]
fn get_localgroup(user: &String) -> Option<bool> {
  let command = Command::new("powershell")
        .arg("$AdminGroupName = (Get-WmiObject -Class Win32_Group -Filter 'LocalAccount = True AND SID = \"S-1-5-32-544\"').Name;")
        .arg("net localgroup $AdminGroupName")
        .creation_flags(0x08000000)
        .stdout(Stdio::piped())
        .spawn()
        .ok()?
        .wait_with_output()
        .ok()?
        .stdout;

  let command = String::from_utf8_lossy(&command);

  let users = command
    .split("-------------------------------------------------------------------------------")
    .collect::<Vec<&str>>()[1]
    .trim()
    .trim()
    .split("\n");

  let mut users = users.collect::<Vec<_>>();
  users.pop();

  let users = users
    .into_iter()
    .map(|x| x.trim().to_lowercase())
    .filter(|x| x == user)
    .collect::<Vec<String>>();

  Some(users.len() > 0 && users.len() <= 1)
}
