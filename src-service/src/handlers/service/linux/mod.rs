use std::{fs, process::Command};

use ahqstore_types::InstallerFormat;

use crate::utils::{
  chmod, get_installer_file, get_program_folder, get_programs, get_target_lnk,
  structs::{AHQStoreApplication, AppData},
};

pub async fn install_app(app: AHQStoreApplication) -> Option<Child> {
  let file = get_installer_file(&app);

  let Some(linux) = app.get_linux_download() else {
    return None;
  };

  match linux.installerType {
    InstallerFormat::LinuxAppImage => {
      deploy_appimg(&file, &app);

      Command::new("bash").arg("true").spawn().ok()
    }
    _ => None,
  }
}

pub fn deploy_appimg(file: &str, app: &AHQStoreApplication) -> Option<()> {
  let install_folder = get_program_folder(&app.appId);
  let version_file = format!("{}/ahqStoreVersion", &install_folder);

  let new_file = format!("{}/app.AppImage", &install_folder);

  let _ = fs::remove_dir_all(&install_folder);
  fs::create_dir_all(&install_folder).ok()?;

  fs::copy(&file, &new_file).ok()?;
  fs::remove_file(&file).ok()?;

  fs::write(version_file, &app.version).ok()?;

  let link = get_target_lnk(&app.appShortcutName.replace(" ", ""));

  let contents = format!(
    r"[Desktop Entry]
Terminal=false
Type=Application
Name={}
Exec={}
Icon={}",
    &app.appShortcutName, &new_file, &new_file
  );

  fs::write(&link, contents).ok()?;

  if !(chmod("a+rx", &link)? && chmod("a+rx", &new_file)?) {
    return None;
  };

  None
}

pub fn uninstall_app(app: &AHQStoreApplication) -> Option<String> {
  let link = get_target_lnk(&app.appShortcutName);
  let program = get_program_folder(&app.appId);

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
      "{}/{}",
      &get_program_folder(&dir),
      "ahqStoreVersion"
    ))
    .unwrap_or("unknown".into());

    vec.push((dir.to_owned(), version));
  }

  Some(vec)
}
