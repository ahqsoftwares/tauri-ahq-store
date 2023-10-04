use std::{fmt::Display, fs};

use crate::encryption;

use super::{get_main_drive, now};

fn get_service_file() -> String {
  format!(
    "{}\\ProgramData\\AHQ Store Applications\\service.encrypted.txt",
    &get_main_drive()
  )
}

fn get_log_file() -> String {
  format!(
    "{}\\ProgramData\\AHQ Store Applications\\server.log.txt",
    &get_main_drive()
  )
}

fn get_old_log_file() -> String {
  format!(
    "{}\\ProgramData\\AHQ Store Applications\\server.old.log.txt",
    &get_main_drive()
  )
}

pub fn write_service<T>(status: T) -> Option<()>
where
  T: ToString,
{
  let file = get_service_file();

  let data = encryption::encrypt_vec(status.to_string())?;

  fs::write(file, data).ok()
}

pub fn write_log<T>(status: T) -> Option<()>
where
  T: Display,
{
  let file_path = get_log_file();

  let mut file =
    fs::read_to_string(&file_path).unwrap_or("----------- SERVER LOG -----------".into());

  file.push_str(&format!("\n{}: {}", now(), status));

  fs::write(file_path, file).ok()
}

pub fn delete_log() -> Option<()> {
  let file_path = get_log_file();
  let old_file_path = get_old_log_file();

  write_service("STOPPED");

  fs::copy(&file_path, &old_file_path).ok();

  fs::remove_file(file_path).ok()
}
