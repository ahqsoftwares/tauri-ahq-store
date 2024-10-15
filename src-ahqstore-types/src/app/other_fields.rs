#[cfg(feature = "js")]
use wasm_bindgen::prelude::wasm_bindgen;

use std::fmt::Display;

use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[cfg_attr(feature = "js", wasm_bindgen(getter_with_clone))]
pub struct DownloadUrl {
  pub installerType: InstallerFormat,
  pub asset: String,

  /// This will be based on asset and releaseId
  pub url: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[cfg_attr(feature = "js", wasm_bindgen)]
pub enum InstallerFormat {
  #[doc = "🎯 Stable as of v1"]
  WindowsZip,

  #[doc = "🎯 Stable as of v2\n\n"]
  WindowsInstallerMsi,

  #[doc = "🔬 Planned as of v2.5 or v3\n\n"]
  /// **Doesn't work**
  /// **⚠️ AHQ Store will act just like downloading from the web and running it ONCE[^1]**
  ///
  /// [^1]: You'll need to provide app's final location
  WindowsInstallerExe,

  #[doc = "🔬 Planned as of v3\n\n"]
  /// **Doesn't work**
  /// **Won't be worked on, until other formats are supported**
  /// **⚠️ AHQ Store will act just like downloading from the web and running it ONCE[^1]**
  ///
  /// [^1]: You'll need to provide app's final location
  WindowsUWPMsix,

  #[doc = "🎯 Stable as of v2\n\n"]
  LinuxAppImage,

  #[doc = "🔬 Planned\n\n"]
  LinuxFlatpak,

  #[doc = "🔬 Planned\nNot allowed to use in AHQ Store repo\n\n"]
  LinuxFlathubFlatpak,

  #[doc = "🔬 Planned\n\n"]
  AndroidApkZip,
}

impl Display for InstallerFormat {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(
      f,
      "{}",
      match &self {
        InstallerFormat::WindowsZip => "Windows Zip",
        InstallerFormat::WindowsInstallerExe => "Windows Installer Exe",
        InstallerFormat::WindowsInstallerMsi => "Windows Installer Msi",
        InstallerFormat::WindowsUWPMsix => "UWP Windows Msix Package",
        InstallerFormat::LinuxAppImage => "Linux App Image",
        InstallerFormat::LinuxFlatpak => "Linux Flatpak",
        InstallerFormat::LinuxFlathubFlatpak =>
          "Linux Flatpak (Flathub, not allowed in ahq store repo)",
        InstallerFormat::AndroidApkZip => "Universal Android Apk Zip Package",
      }
    )
  }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[cfg_attr(feature = "js", wasm_bindgen(getter_with_clone))]
pub struct AppRepo {
  /// author must be your GitHub username or username of an org where you're a "visible" member
  pub author: String,
  pub repo: String,
}
