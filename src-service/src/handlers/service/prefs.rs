use std::fs;

use crate::{
  encryption::{decrypt2, encrypt2},
  utils::get_main_drive,
};
use ahqstore_types::Prefs;

use lazy_static::lazy_static;

lazy_static! {
  static ref PREFS: String = format!(
    "{}\\ProgramData\\AHQ Store Applications\\perfs.encryped",
    get_main_drive()
  );
}

pub fn get_prefs() -> Option<Prefs> {
  Prefs::str_to(&decrypt2(Prefs::get(&PREFS)?)?)
}

pub fn set_prefs(values: Prefs) -> Option<()> {
  let data = values.convert()?;
  let encrypted = encrypt2(data)?;

  fs::write(PREFS.as_str(), encrypted).ok()
}
