use crate::{ServerJSONResp, Str};
use serde::{Deserialize, Serialize};
use serde_json::from_str;
use std::collections::HashMap;

pub mod install;
mod other_fields;

pub use install::*;
pub use other_fields::*;

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AHQStoreApplication {
  pub appId: Str,
  pub appShortcutName: Str,
  pub appDisplayName: Str,
  pub authorId: Str,
  pub downloadUrls: HashMap<u8, DownloadUrl>,
  pub install: InstallerOptions,
  pub displayImages: Vec<Str>,
  pub description: Str,
  pub icon: Str,
  pub repo: AppRepo,
  pub version: Str,

  /// The Site to your app
  pub site: Option<Str>,

  /// This'll be ignored unless you're ahq_verified tag which no one except AHQ Store Team has
  /// 
  /// The general dev isn't meant to redistribute others' apps
  pub source: Option<Str>
}

impl AHQStoreApplication {
  pub fn get_win32_download(&self) -> Option<&DownloadUrl> {
    let Some(win32) = &self.install.win32 else {
      return None;
    };

    let url = self.downloadUrls.get(&win32.assetId)?;

    match &url.installerType {
      InstallerFormat::WindowsZip
      | InstallerFormat::WindowsInstallerExe
      | InstallerFormat::WindowsInstallerMsi
      | InstallerFormat::WindowsUWPMsix => Some(&url),
      _ => None,
    }
  }

  pub fn get_win32_extension(&self) -> Option<&'static str> {
    match self.get_win32_download()?.installerType {
      InstallerFormat::WindowsZip => Some(".zip"),
      InstallerFormat::WindowsInstallerExe => Some(".exe"),
      InstallerFormat::WindowsInstallerMsi => Some(".msi"),
      InstallerFormat::WindowsUWPMsix => Some(".msix"),
      _ => None,
    }
  }

  pub fn get_linux_download(&self) -> Option<&DownloadUrl> {
    let Some(linux) = &self.install.linux else {
      return None;
    };

    let url = self.downloadUrls.get(&linux.assetId)?;

    match &url.installerType {
      InstallerFormat::LinuxAppImage => Some(&url),
      _ => None,
    }
  }

  pub fn get_linux_extension(&self) -> Option<&'static str> {
    match self.get_linux_download()?.installerType {
      InstallerFormat::LinuxAppImage => Some(".AppImage"),
      _ => None,
    }
  }

  pub fn has_platform(&self) -> bool {
    #[cfg(windows)]
    return self.get_win32_download().is_some();

    #[cfg(target_os = "linux")]
    return self.get_linux_download().is_some();

    #[cfg(not(any(windows, target_os = "linux")))]
    return false;
  }

  #[cfg(windows)]
  pub fn get_platform_deps(&self) -> Option<Vec<Win32Deps>> {
    if let Some(x) = &self.install.win32 {
      return Some(x.clone().deps.unwrap_or(vec![]));
    }

    None
  }
}

impl TryFrom<ServerJSONResp> for AHQStoreApplication {
  type Error = serde_json::Error;

  fn try_from(value: ServerJSONResp) -> Result<Self, Self::Error> {
    from_str(&value.config)
  }
}
