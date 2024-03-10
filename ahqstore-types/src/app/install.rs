use crate::Str;
use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InstallerOptions {
  pub win32: Option<InstallerOptionsWin32>,
  pub linux: Option<InstallerOptionsLinux>,
  pub installType: InstallType,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
/// 🔬 in testing
pub enum InstallType {
  PerUser,
  Computer,
  Both,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InstallerOptionsWin32 {
  pub assetId: u8,
  pub exec: Option<Str>,
  pub installerArgs: Option<Vec<Str>>,
  pub deps: Option<Vec<Win32Deps>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Win32Deps {
  AHQStoreAPI,
  Node21,
  Node18,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InstallerOptionsLinux {
  pub assetId: u8,
  pub deps: Option<Vec<UnixDeps>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum UnixDeps {
  AHQStoreAPI,
  Node21,
  Node18,
}
