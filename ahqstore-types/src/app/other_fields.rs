use crate::Str;
use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct DownloadUrl {
  pub installerType: InstallerFormat,
  pub url: Str,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum InstallerFormat {
  #[doc = "🎯 Stable as of v1"]
  WindowsZip,

  #[doc = "🔬 Unstable; AHQ Store vNext\n\n"]
  /// **⚠️ AHQ Store will act just like downloading from the web and running it ONCE[^1]**
  ///
  /// [^1]: You'll need to provide app's final location
  WindowsInstallerExe,

  #[doc = "🔬 Unstable; AHQ Store vNext\n\n"]
  /// **⚠️ AHQ Store will act just like downloading from the web and running it ONCE[^1]**
  ///
  /// [^1]: You'll need to provide app's final location
  WindowsInstallerMsi,

  #[doc = "🔬 Unstable; AHQ Store vNext\n\n"]
  /// **⚠️ AHQ Store will act just like downloading from the web and running it ONCE[^1]**
  ///
  /// [^1]: You'll need to provide app's final location
  WindowsUWPMsix,

  #[doc = "🔬 Unstable; AHQ Store vNext"]
  LinuxAppImage,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AppRepo {
  pub author: Str,
  pub repo: Str,
}
