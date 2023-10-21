mod chalk;
mod install;
mod release;

use std::{
  env::{args, current_exe},
  process::{self, Command},
  thread,
  time::Duration,
};

use chalk::ERROR;
use is_elevated::is_elevated;

fn main() {
  println!("AHQ Store PostInstall Script");

  let verbose = args().into_iter().find(|arg| &arg == &"-v").is_some();

  if !is_elevated() {
    chalk::warn("Relaunching as Admin...");

    let exe = current_exe().expect(&format!(
      "{}Failed to get current executable path",
      chalk::ERROR.as_str()
    ));

    let mut process = Command::new("powershell");
    let process = process.arg("start-process").arg(exe);

    if verbose {
      process.arg("-args \"-v\"");
    }

    process
      .arg("-verb runas")
      .spawn()
      .expect(&format!("{} Failed to run as admin", ERROR.as_str()));

    process::exit(0);
  }
  chalk::info("Uninstalling Service (if installed)");
  install::uninstall_service(verbose);

  chalk::info("Downloading Newer Service");
  release::download_release(verbose);

  chalk::info("Installing Newer Service");
  install::install_service(verbose);

  chalk::info("Trying to launch AHQ Store");
  let _ = Command::new("powershell")
    .args([
      "start-process",
      &format!(
        "\"{}\\Program Files\\AHQ Store\\AHQ Store.exe\"",
        std::env::var("SystemDrive").unwrap()
      ),
    ])
    .spawn();
  thread::sleep(Duration::from_secs(3));
}
