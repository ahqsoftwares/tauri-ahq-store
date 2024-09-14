use std::{
  process::{Command, Stdio},
  thread::{self, JoinHandle},
};

use super::DEFENDER_CMD;

pub type Malicious = bool;

pub fn scan_threaded(path: &str) -> JoinHandle<Option<Malicious>> {
  let child = Command::new(DEFENDER_CMD)
    .args(["-Scan", "-ScanType", "3", "-File"])
    .arg(path)
    .stdout(Stdio::piped())
    .spawn();

  let okay = format!("Scanning {} found no threats", &path);

  thread::spawn(move || {
    let out = child.ok()?.wait_with_output().ok()?.stdout;

    let out = String::from_utf8_lossy(&out);

    if out.contains(&okay) {
      return Some(false);
    }

    Some(true)
  })
}
