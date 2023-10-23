mod http;
mod prefs;

use mslnk::ShellLink;
use std::{fs, os::windows::process::CommandExt, process::Command};

pub use http::*;
pub use prefs::*;

use crate::windows::utils::{
  get_installer_file, get_program_folder, get_programs, get_target_lnk,
  structs::{AHQStoreApplication, AppData},
};

pub fn install_app(app_id: String, app: AHQStoreApplication) -> Option<()> {
  let zip = get_installer_file(&app_id);

  let install_folder = get_program_folder(&app_id);
  let version_file = format!("{}\\ahqStoreVersion", install_folder);

  let _ = fs::remove_dir_all(&install_folder);
  fs::create_dir_all(&install_folder).ok()?;

  let cmd = Command::new("powershell")
    .creation_flags(0x08000000)
    .args(["-NoProfile", "-WindowStyle", "Minimized"])
    .args([
      "Expand-Archive",
      format!("-Path \"{}\"", &zip).as_str(),
      format!("-DestinationPath \"{}\"", &install_folder).as_str(),
      "-Force",
    ])
    .spawn();

  let cleanup = |err| {
    let _ = fs::remove_file(&zip);

    if err {
      let _ = fs::remove_dir_all(&install_folder);
    } else {
      let link = ShellLink::new(format!("{}\\{}", &install_folder, &app.exe)).unwrap();
      link.create_lnk(get_target_lnk(&app.title)).unwrap();
    }
  };

  if let Ok(mut child) = cmd {
    if let Ok(status) = child.wait() {
      if status.success() {
        if let Some(_) = fs::write(&version_file, &app.version).ok() {
          cleanup(false);
          return Some(());
        }
      }
    }
  }
  cleanup(true);
  None
}

pub fn uninstall_app(app_id: String, title: String) -> Option<String> {
  let link = get_target_lnk(&title);
  let program = get_program_folder(&app_id);

  let _ = fs::remove_file(&link);

  fs::remove_dir_all(&program).ok()?;

  app_id.into()
}

pub fn list_apps() -> Option<Vec<AppData>> {
  let folder = get_programs();

  let dirs = fs::read_dir(&folder).ok()?;

  let mut vec = vec![];

  for dir in dirs {
    let dir = dir.ok()?.file_name();
    let dir = dir.to_str()?;

    let version = fs::read_to_string(format!(
      "{}\\{}",
      &get_program_folder(&dir),
      "ahqStoreVersion"
    ))
    .ok()?;

    vec.push((dir.to_owned(), version));
  }

  Some(vec)
}
