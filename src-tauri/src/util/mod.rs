use std::{
    os::windows::process::CommandExt,
    process::{Command, Stdio},
};

use serde_json::Value;
use reqwest::{blocking::ClientBuilder, header::{HeaderMap, HeaderValue}};

pub mod structs;

pub fn get_service_url() -> String {
    let mut map = HeaderMap::new();
    map.insert("User-Agent", HeaderValue::from_str("AHQ Store/Service Installer").unwrap());
    
    let client = ClientBuilder::new()
        .default_headers(map)
        .build()
        .unwrap();

    let get = client.get("https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases/latest").send().unwrap().json::<Value>().unwrap();

    let assets = get["assets"].as_array().unwrap();

    for asset in assets {
        let asset_name = asset["name"].as_str().unwrap();

        if asset_name == "store-tools-installer.exe" {
            return asset["browser_download_url"].as_str().unwrap().to_string()
        }
    };

    panic!("");
}

#[tauri::command(async)]
pub fn is_an_admin() -> bool {
    if let Some(x) = get_whoami() {
        return get_localgroup(&x)
    }
    false
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
            if let Ok(output) = String::from_utf8(status.stdout) {
                let new_whoami = output.split("\\").collect::<Vec<&str>>()[1]
                    .trim()
                    .to_string();

                whoami = Some(new_whoami);
            }
        }
    }

    whoami
}

fn get_localgroup(user: &String) -> bool {
    let command = Command::new("powershell")
        .args(["net", "localgroup", "administrators"])
        .creation_flags(0x08000000)
        .stdout(Stdio::piped())
        .spawn();

    if let Ok(child) = command {
        if let Ok(status) = child.wait_with_output() {
            if let Ok(output) = String::from_utf8(status.stdout) {
                let output = output.split("-------------------------------------------------------------------------------")
                        .collect::<Vec<&str>>()[1]
                        .trim()
                        .replace("The command completed successfully.", "")
                        .trim()
                        .split("\n")
                        .collect::<Vec<&str>>()
                        .into_iter()
                        .map(|x| x.trim().to_lowercase())
                        .filter(|x| x == user)
                        .collect::<Vec<String>>();

                return output.len() >= 1;
            }
        }
    }
    false
}
