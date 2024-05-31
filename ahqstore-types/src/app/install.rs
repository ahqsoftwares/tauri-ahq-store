use crate::Str;
use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InstallerOptions {
  pub win32: Option<InstallerOptionsWin32>,
  #[doc = "🔬 Planned\n\n"]
  pub linux: Option<InstallerOptionsLinux>,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InstallerOptionsWin32 {
  pub assetId: u8,
  /// The exe to link as a shortcut[^1]
  /// 
  /// [^1]: Only if you choose WindowsZip
  pub exec: Option<Str>,
  #[doc = "🔬 Planned\n\n"]
  /// Args to pass to the custom exe installer[^1]
  /// 
  /// [^1]: Only if you choose WindowsInstallerExe 
  pub installerArgs: Option<Vec<Str>>
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[doc = "🔬 Planned\n\n"]
pub struct InstallerOptionsLinux {
  pub assetId: u8
}
