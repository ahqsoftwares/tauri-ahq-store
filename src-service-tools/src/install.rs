use std::process::{Command, Stdio};

use crate::{
  chalk::{info, warn},
  release::SERVICE_PATH,
};

pub fn uninstall_service(verbose: bool) {
  let data = Command::new("sc.exe")
    .args(["stop", "AHQ Store Service"])
    .stdout(Stdio::piped())
    .spawn()
    .unwrap()
    .wait_with_output()
    .unwrap()
    .stdout;

  if verbose {
    let data = String::from_utf8_lossy(&data).replace("\n", "\n  ");

    if data.contains("FAILED") {
      warn(&data);
    } else {
      info(&data)
    }
  }

  let data = Command::new("sc.exe")
    .args(["delete", "AHQ Store Service"])
    .stdout(Stdio::piped())
    .spawn()
    .unwrap()
    .wait_with_output()
    .unwrap()
    .stdout;

  if verbose {
    let data = String::from_utf8_lossy(&data).replace("\n", "\n  ");

    if data.contains("FAILED") {
      warn(&data);
    } else {
      info(&data);
    }
  }
}

pub fn install_service(verbose: bool) {
  let data = Command::new("sc.exe")
    .stdout(Stdio::piped())
    .args([
      "create",
      "AHQ Store Service",
      "start=",
      "auto",
      "binpath=",
      SERVICE_PATH.as_str(),
    ])
    .spawn()
    .unwrap()
    .wait_with_output()
    .unwrap()
    .stdout;

  if verbose {
    let data = String::from_utf8_lossy(&data).replace("\n", "\n  ");

    if data.contains("FAILED") {
      warn(&data);
    } else {
      info(&data);
    }
  }

  let data = Command::new("sc.exe")
    .args(["start", "AHQ Store Service"])
    .stdout(Stdio::piped())
    .spawn()
    .unwrap()
    .wait_with_output()
    .unwrap()
    .stdout;

  if verbose {
    let data = String::from_utf8_lossy(&data).replace("\n", "\n  ");

    if data.contains("FAILED") {
      warn(&data);
    } else {
      info(&data);
    }
  }
}
