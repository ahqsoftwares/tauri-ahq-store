use winreg::enums::*;
use winreg::RegKey;

#[cfg(windows)]
pub fn create_association() -> Option<()> {
  let root = RegKey::predef(HKEY_CLASSES_ROOT);

  let (key, _) = root.create_subkey("ahqstore").ok()?;
  key.set_value("", &"AHQ Store").ok()?;

  let (icon, _) = key.create_subkey("DefaultIcon").ok()?;
  icon
    .set_value("", &r"C:\Program Files\AHQ Store\AHQ Store.exe,0")
    .ok()?;

  let (shell, _) = key.create_subkey("shell").ok()?;
  let (shell, _) = shell.create_subkey("open").ok()?;
  let (shell, _) = shell.create_subkey("command").ok()?;
  shell
    .set_value(
      "",
      &r"C:\Program Files\AHQ Store\AHQ Store.exe protocol %1",
    )
    .ok()?;

  Some(())
}
