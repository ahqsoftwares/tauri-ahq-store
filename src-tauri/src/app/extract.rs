use std::{env::current_exe, ffi::OsStr};

#[cfg(windows)]
use std::os::windows::process::CommandExt;
use std::process::Command;

pub fn run_admin<T: AsRef<OsStr>>(path: T) {
  #[cfg(windows)]
  {
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

  #[cfg(unix)]
  {
    Command::new("nohup")
      .arg(path)
      .spawn()
      .unwrap();
  }
}
