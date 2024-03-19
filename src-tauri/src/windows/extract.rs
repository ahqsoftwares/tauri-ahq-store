use std::env::current_exe;
use std::os::windows::process::CommandExt;
use std::process::Command;

pub fn run_admin(path: String) {
  let mut child = Command::new("powershell");

  let exe = current_exe().unwrap();

  child
    .creation_flags(0x08000000)
    .arg("start-process")
    .arg(path)
    .args(["-verb", "runas"])
    .arg("-wait; start-process")
    .arg(exe);

  let _ = child.spawn().unwrap();
}
