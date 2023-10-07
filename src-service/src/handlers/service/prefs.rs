use ahqstore_types::Prefs;
use crate::utils::get_main_drive;

static PATH: &str = "{root}\\ProgramData\\AHQ Store Applications\\perfs.encryped";

pub fn get() -> Option<Prefs> {
  let path = PATH.replace("{root}", &get_main_drive());
  
  Prefs::str_to(Prefs::get(&vector).ok()?).ok()
}

pub fn set(values: &str) -> Option<()> {
  let path = PATH.replace("{root}", &get_main_drive());
  
  let data = (Prefs::str_to(values).ok()?).convert().ok()?;
}