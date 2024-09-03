use std::os::windows::process::CommandExt;
use std::process::Command;

pub fn install_msi(path: &str) {
  Command::new("powershell")
    .args([
      "start-process",
      "-FilePath",
      &format!("\"{}\"", &path),
      "-Wait",
      "-ArgumentList",
      "/quiet, /passive",
    ])
    .creation_flags(0x08000000)
    .spawn()
    .unwrap()
    .wait()
    .unwrap();
}

pub fn install_service(path: &str) {
  Command::new("sc.exe")
    .creation_flags(0x08000000)
    .args([
      "create",
      "AHQ Store Service",
      "start=",
      "auto",
      "binpath=",
      path,
    ])
    .spawn()
    .unwrap()
    .wait()
    .unwrap();

  Command::new("sc.exe")
    .creation_flags(0x08000000)
    .args(["start", "AHQ Store Service"])
    .spawn()
    .unwrap()
    .wait()
    .unwrap();
}
