use crate::Str;
use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InstallerOptions {
  pub win32: Option<InstallerOptionsWin32>,
  #[doc = "🔬 Planned\n\n"]
  pub linux: Option<InstallerOptionsLinux>,
  #[doc = "🔬 Planned\n\n"]
  pub installType: InstallType,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[doc = "🔬 Planned\n\n"]
pub enum InstallType {
  PerUser,
  Computer,
  Both,
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
  pub installerArgs: Option<Vec<Str>>,
  #[doc = "🔬 Planned\n\n"]
  /// A list of dependencies to bundle[^1]
  /// 
  /// [^1]: Might be implemented in the future!
  pub deps: Option<Vec<Win32Deps>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Win32Deps {
  #[doc = "🔬 Planned\n\n"]
  AHQStoreAPI,
  #[doc = "🔬 Planned\n\n"]
  Node21,
  #[doc = "🔬 Planned\n\n"]
  Node18,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[doc = "🔬 Planned\n\n"]
pub struct InstallerOptionsLinux {
  pub assetId: u8
}
