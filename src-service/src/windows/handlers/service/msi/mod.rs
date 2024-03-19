use msi::open;
use winreg::{enums::HKEY_LOCAL_MACHINE, RegKey};

use std::fs;

use crate::windows::utils::get_program_folder;

use super::run;

fn msi_from_id(app_id: &str) -> String {
  let dir = get_program_folder(app_id);

  format!("{dir}/installer.msi")
}

pub fn is_msi(app_id: &str) -> bool {
  fs::metadata(msi_from_id(app_id)).is_ok()
}

pub fn exists(app_id: &str) -> Option<bool> {
  let msi = msi_from_id(app_id);

  let msi = open(msi).ok()?;
  let title = msi.summary_info().subject()?;

  println!("Title: {}", &title);

  let reg = RegKey::predef(HKEY_LOCAL_MACHINE);
  let reg = reg
    .open_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall")
    .ok()?;

  let vect: Vec<_> = reg
    .enum_keys()
    .into_iter()
    .map(|f| f.ok())
    .filter(|f| {
      if let Some(f) = f {
        let calc: Option<bool> = (|| {
          let r = &reg
          .open_subkey(&f)
          .ok()?
          .get_value::<String, &str>("DisplayName")
          .unwrap_or("".into());
        
          Some(
            &r
              == &title,
          )
        })();
        return calc.unwrap_or(false);
      }
      false
    })
    .collect();

  Some(vect.len() == 1)
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
