use msi::{open, Select};
use winreg::{enums::HKEY_LOCAL_MACHINE, RegKey};

use std::fs::{self, File};

use crate::windows::utils::get_program_folder;

use super::run;

fn msi_from_id(app_id: &str) -> String {
  let dir = get_program_folder(app_id);

  format!("{dir}/installer.msi")
}

pub fn is_msi(app_id: &str) -> bool {
  fs::metadata(msi_from_id(app_id)).is_ok()
}

fn get_product_code(msi: &mut msi::Package<File>) -> Option<String> {
  let mut property = msi.select_rows(
      Select::table("Property")
  ).ok()?;

  property.find(|x| &x[0].as_str() == &Some("ProductCode"))?[1].as_str().map_or_else(|| None, |x| Some(x.into()))
}

pub fn exists(app_id: &str) -> Option<bool> {
  let msi = msi_from_id(app_id);

  let mut msi = open(msi).ok()?;
  
  let product_code = get_product_code(&mut msi)?;

  println!("Code: {}", &product_code);

  let reg = RegKey::predef(HKEY_LOCAL_MACHINE);
  reg
    .open_subkey(
      &format!("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{}", &product_code)
    )
    .ok()?;

  Some(true)
}

pub fn uninstall_msi(app_id: &str) -> Option<()> {
  let msi = msi_from_id(app_id);

  if exists(&app_id).unwrap_or(false) {
    return match run("msiexec", &["/passive", "/qn", "/x", &msi])
      .ok()?
      .wait()
      .ok()?
      .success()
    {
      true => Some(()),
      _ => None,
    };
  }
  None
}
