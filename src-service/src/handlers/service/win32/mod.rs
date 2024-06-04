mod msi;

use ahqstore_types::InstallerFormat;
use mslnk::ShellLink;
use serde_json::to_string_pretty;
use std::{
  fs,
  io::Error,
  os::windows::process::CommandExt,
  process::{Child, Command},
};

use crate::{
  handlers::install_node,
  utils::{
    get_installer_file, get_program_folder, get_programs, get_target_lnk,
    structs::{AHQStoreApplication, AppData},
  },
};

pub fn run(path: &str, args: &[&str]) -> Result<Child, Error> {
  Command::new(path)
    .creation_flags(0x08000000)
    .args(args)
    .spawn()
}

pub fn unzip(path: &str, dest: &str) -> Result<Child, Error> {
  Command::new("powershell")
    .creation_flags(0x08000000)
    .args(["-NoProfile", "-WindowStyle", "Minimized"])
    .args([
      "Expand-Archive",
      format!("-Path \"{}\"", &path).as_str(),
      format!("-DestinationPath \"{}\"", &dest).as_str(),
      "-Force",
    ])
    .spawn()
}

pub async fn install_app(app: AHQStoreApplication) -> Option<()> {
  let file = get_installer_file(&app);

  let Some(win32) = app.get_win32_download() else {
    return None;
  };

  println!("{:?}", &win32.installerType);
  match win32.installerType {
    InstallerFormat::WindowsZip => load_zip(&file, &app),
    InstallerFormat::WindowsInstallerMsi => install_msi(&file, &app),
    _ => None,
  }
}

pub fn install_msi(msi: &str, app: &AHQStoreApplication) -> Option<()> {
  let install_folder = get_program_folder(&app.appId);

  fs::create_dir_all(&install_folder).ok()?;

  let to_exec_msi = format!("{}\\installer.msi", &install_folder);

  fs::copy(&msi, &to_exec_msi).ok()?;
  fs::write(
    format!("{}\\app.json", &install_folder),
    to_string_pretty(&app).ok()?,
  )
  .ok()?;
  fs::write(
    format!("{}\\ahqStoreVersion", &install_folder),
    &app.version,
  )
  .ok()?;
  fs::remove_file(&msi).ok()?;

  match run("msiexec", &["/norestart", "/qn", "/i", &to_exec_msi])
    .ok()?
    .wait()
    .ok()?
    .success()
  {
    true => Some(()),
    false => None,
  }
}

pub fn load_zip(zip: &str, app: &AHQStoreApplication) -> Option<()> {
  let install_folder = get_program_folder(&app.appId);
  let version_file = format!("{}\\ahqStoreVersion", install_folder);

  let _ = fs::remove_dir_all(&install_folder);
  fs::create_dir_all(&install_folder).ok()?;

  let cmd = unzip(&zip, &install_folder);

  let cleanup = |err| {
    let _ = fs::remove_file(&zip);

    if err {
      let _ = fs::remove_dir_all(&install_folder);
    } else {
      if let Some(val) = &app.install.win32 {
        if let Some(exec) = &val.exec {
          if let Ok(link) = ShellLink::new(format!("{}\\{}", &install_folder, &exec)) {
            let _ = link.create_lnk(get_target_lnk(&app.appShortcutName));
          }
        }
      }
    }
  };

  if let Ok(mut child) = cmd {
    if let Ok(status) = child.wait() {
      if status.success() {
        if let Some(_) = fs::write(&version_file, &app.version).ok() {
          if let Some(_) = fs::write(
            format!("{}\\app.json", &install_folder),
            to_string_pretty(&app).ok()?,
          )
          .ok()
          {
            cleanup(false);
          }
          return Some(());
        }
      }
    }
  }
  cleanup(true);
  None
}

pub fn uninstall_app(app: &AHQStoreApplication) -> Option<String> {
  let link = get_target_lnk(&app.appShortcutName);
  let program = get_program_folder(&app.appId);

  if msi::is_msi(&app.appId) {
    msi::uninstall_msi(&app.appId);
  }

  let _ = fs::remove_file(&link);

  fs::remove_dir_all(&program).ok()?;

  Some(app.appId.clone())
}

pub fn list_apps() -> Option<Vec<AppData>> {
  let folder = get_programs();

  let dirs = fs::read_dir(&folder).ok()?;

  let mut vec = vec![];

  for dir in dirs {
    let dir = dir.ok()?.file_name();
    let dir = dir.to_str().unwrap_or("unknown");

    let version = fs::read_to_string(format!(
      "{}\\{}",
      &get_program_folder(&dir),
      "ahqStoreVersion"
    ))
    .unwrap_or("unknown".into());

    if msi::is_msi(dir) {
      if msi::exists(dir).unwrap_or(false) {
        vec.push((dir.to_owned(), version));
      }
    } else {
      vec.push((dir.to_owned(), version));
    }
  }

  Some(vec)
}
