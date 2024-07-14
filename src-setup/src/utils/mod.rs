use dirs::home_dir;
use lazy_static::lazy_static;

#[cfg(windows)]
lazy_static! {
  pub static ref ROOT_DIR: String = std::env::var("SystemDrive").unwrap();
  pub static ref AHQSTORE_ROOT: String = format!(
    "{}{}ProgramData{}AHQ Store Applications",
    &*ROOT_DIR, &SEP, &SEP
  );
}

#[cfg(unix)]
lazy_static! {
  pub static ref ROOT_DIR: String = "/".into();
  pub static ref AHQSTORE_ROOT: String = "/ahqstore".into();
}

#[cfg(windows)]
static SEP: &'static str = "\\";

#[cfg(unix)]
static SEP: &'static str = "/";

lazy_static! {
  pub static ref PROGRAMS: String = format!("{}{}Programs", &*AHQSTORE_ROOT, &SEP,);
  pub static ref UPDATERS: String = format!("{}{}Updaters", &*AHQSTORE_ROOT, &SEP);
  pub static ref INSTALLERS: String = format!("{}{}Installers", &*AHQSTORE_ROOT, &SEP);
}

pub fn get_install() -> String {
  let mut path = home_dir().unwrap();
  #[cfg(windows)]
  path.push("ahqstore.msi");

  #[cfg(not(windows))]
  path.push("ahqstore.deb");

  path.to_str().unwrap().to_string()
}

pub fn get_service_dir() -> String {
  use std::fs;
  #[cfg(windows)]
  {
    use std::{os::windows::process::CommandExt, process::Command};

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
  }

  let _ = fs::create_dir_all(&*AHQSTORE_ROOT);
  let _ = fs::create_dir_all(&*PROGRAMS);
  let _ = fs::create_dir_all(&*UPDATERS);
  let _ = fs::create_dir_all(&*INSTALLERS);

  #[cfg(windows)]
  return format!("{}\\service.exe", &*AHQSTORE_ROOT);

  #[cfg(unix)]
  return format!("{}/service", &*AHQSTORE_ROOT);
}

#[cfg(unix)]
pub fn get_temp_service_dir() -> String {
  let mut path = home_dir().unwrap();

  path.push("ahqstore_service");
  path.to_str().unwrap().to_string()
}
