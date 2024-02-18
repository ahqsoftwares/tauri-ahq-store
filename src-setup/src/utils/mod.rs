use dirs::home_dir;
use lazy_static::lazy_static;

#[cfg(windows)]
lazy_static! {
  pub static ref ROOT_DIR: String = std::env::var("SystemDrive").unwrap();
  pub static ref AHQSTORE_ROOT: String =
    format!("{}\\ProgramData\\AHQ Store Applications", &*ROOT_DIR);
  pub static ref PROGRAMS: String = format!(
    "{}\\ProgramData\\AHQ Store Applications\\Programs",
    &*ROOT_DIR
  );
  pub static ref UPDATERS: String = format!(
    "{}\\ProgramData\\AHQ Store Applications\\Updaters",
    &*ROOT_DIR
  );
  pub static ref INSTALLERS: String = format!(
    "{}\\ProgramData\\AHQ Store Applications\\Installers",
    &*ROOT_DIR
  );
}

pub fn get_install() -> String {
  let mut path = home_dir().unwrap();
  path.push("AppData\\Local\\Temp\\ahqstore.msi");

  path.to_str().unwrap().to_string()
}

#[cfg(windows)]
pub fn get_service_dir() -> String {
  use std::{fs, os::windows::process::CommandExt, process::Command};

  Command::new("sc.exe")
    .creation_flags(0x08000000)
    .args(["stop", "AHQ Store Service"])
    .spawn()
    .unwrap()
    .wait()
    .unwrap();

  Command::new("sc.exe")
    .creation_flags(0x08000000)
    .args(["delete", "AHQ Store Service"])
    .spawn()
    .unwrap()
    .wait()
    .unwrap();

  let _ = fs::create_dir_all(&*AHQSTORE_ROOT);
  let _ = fs::create_dir_all(&*PROGRAMS);
  let _ = fs::create_dir_all(&*UPDATERS);
  let _ = fs::create_dir_all(&*INSTALLERS);

  format!("{}\\service.exe", &*AHQSTORE_ROOT)
}
