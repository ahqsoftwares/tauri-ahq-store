use std::time::{SystemTime, UNIX_EPOCH};

mod db;
mod log_file;

use ahqstore_types::AHQStoreApplication;
pub use db::*;
pub use log_file::*;

pub mod structs;

pub fn get_program_folder(app_id: &str) -> String {
  format!(
    "{}\\ProgramData\\AHQ Store Applications\\Programs\\{}",
    &get_main_drive(),
    &app_id
  )
}

pub fn get_programs() -> String {
  format!(
    "{}\\ProgramData\\AHQ Store Applications\\Programs",
    &get_main_drive()
  )
}

pub fn get_installer_file(app: &AHQStoreApplication) -> String {
  format!(
    "{}\\ProgramData\\AHQ Store Applications\\Installers\\{}.{}",
    &get_main_drive(),
    &app.appId,
    &app.get_win32_extension().unwrap_or(".unknown")
  )
}

pub fn get_file_on_root(file: &str) -> String {
  format!(
    "{}\\ProgramData\\AHQ Store Applications\\{}",
    &get_main_drive(),
    &file
  )
}

pub fn get_target_lnk(name: &str) -> String {
  format!(
    "{}\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\AHQ Store\\{}.lnk",
    &get_main_drive(),
    &name
  )
}

pub fn now() -> u64 {
  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap()
    .as_secs()
}

pub fn get_main_drive() -> String {
  std::env::var("SystemDrive")
    .unwrap_or("C:".into())
    .to_string()
}
