use std::{
  os::windows::process::CommandExt,
  process::{Command, Stdio},
};

use lazy_static::lazy_static;
use reqwest::{
  blocking::{Client, ClientBuilder},
  header::{HeaderMap, HeaderValue},
};
use serde_json::Value;

pub use crate::structs;

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

pub fn get_service_url() -> String {
  let get = CLIENT
    .get("https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases/latest")
    .send()
    .unwrap()
    .json::<Value>()
    .unwrap();

  let assets = get["assets"].as_array().unwrap();

  for asset in assets {
    let asset_name = asset["name"].as_str().unwrap();

    if asset_name.ends_with("setup.exe") {
      return asset["browser_download_url"].as_str().unwrap().to_string();
    }
  }

  panic!("");
}

#[tauri::command(async)]
pub fn is_an_admin() -> bool {
  get_whoami().map_or_else(|| false, |x| get_localgroup(&x).unwrap_or(false))
}

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
