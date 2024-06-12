use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string, to_string_pretty};
use std::fs::read;

pub type AppId = String;
pub type Str = String;
pub type AppData = (String, String);
pub type RefId = u64;

pub mod app;
pub use app::*;

pub mod api;
pub use api::*;

pub mod data;
pub use data::*;
/// **You should use cli**
/// ```sh
/// cargo install ahqstore_cli_rs
/// ```
/// or visit app / api sub module
/// 
/// This Module:
/// This module lists the standard commands that AHQ Store sends to AHQ Store Service

#[derive(Serialize, Deserialize, Debug)]
pub struct Commit {
  pub sha: String
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Prefs {
  pub launch_app: bool,
  pub install_apps: bool,
  pub auto_update_apps: bool
}

impl Prefs {
  pub fn get(path: &str) -> Option<Vec<u8>> {
    read(&path).ok()
  }

  pub fn str_to(s: &str) -> Option<Self> {
    from_str(s).ok()
  }

  pub fn convert(&self) -> Option<String> {
    to_string(self).ok()
  }

  pub fn default() -> Self {
    Self {
      launch_app: true,
      install_apps: true,
      auto_update_apps: true,
    }
  }
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Package {
  LeadLang,
  DevCamp
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Command {
  GetSha(RefId),

  GetApp(RefId, AppId),
  InstallApp(RefId, AppId),
  UninstallApp(RefId, AppId),

  ListApps(RefId),
  GetLibrary(RefId),

  RunUpdate(RefId),
  UpdateStatus(RefId),

  GetPrefs(RefId),
  SetPrefs(RefId, Prefs),

  AddPkg(RefId, Package),
}

impl Command {
  pub fn try_from<T: AsRef<str>>(value: T) -> Option<Self> {
    serde_json::from_str(value.as_ref()).ok()
  }
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Reason {
  UnknownData(RefId),

  Unauthenticated,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum ErrorType {
  GetAppFailed(RefId, AppId),
  AppPlatformNoSupport(RefId, AppId),
  PrefsError(RefId),
  PkgError(RefId),
  GetSHAFailed(RefId),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Library {
  pub app_id: String,
  pub status: AppStatus,
  pub is_update: bool,
  pub to: ToDo,
  pub progress: f64,
  pub app: Option<AHQStoreApplication>
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ToDo {
  Install,
  Uninstall,
}

#[derive(Debug, Deserialize, Clone)]
pub enum AppStatus {
  Pending,
  Downloading,
  Installing,
  Uninstalling,
  InstallSuccessful,
  UninstallSuccessful,
  NotSuccessful,
}

impl Serialize for AppStatus {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: serde::Serializer,
  {
    serializer.serialize_str(match self {
      AppStatus::Pending => "Pending...",
      AppStatus::Downloading => "Downloading...",
      AppStatus::Installing => "Installing...",
      AppStatus::Uninstalling => "Uninstalling...",
      AppStatus::InstallSuccessful => "Installed",
      AppStatus::UninstallSuccessful => "Uninstalled",
      AppStatus::NotSuccessful => "Error!",
    })
  }
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum UpdateStatusReport {
  Disabled,
  UpToDate,
  Checking,
  Updating,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Response {
  Ready,

  Error(ErrorType),

  SHAId(RefId, String),

  Disconnect(Reason),

  AppData(RefId, AppId, AHQStoreApplication),
  AppDataUrl(RefId, AppId, String),

  ListApps(RefId, Vec<AppData>),
  Library(RefId, Vec<Library>),

  UpdateStatus(RefId, UpdateStatusReport),

  Acknowledged(RefId),

  Prefs(RefId, Prefs),
  PrefsSet(RefId),

  DownloadPkgProg(RefId, [u64; 2]),
  InstallPkg(RefId),
  InstalledPkg(RefId),

  TerminateBlock(RefId),
}

impl Response {
  pub fn as_msg(msg: Self) -> Vec<u8> {
    to_string_pretty(&msg)
      .unwrap_or("ERRR".to_string())
      .into_bytes()
  }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AuthPing {
  pub process: usize,
}

impl AuthPing {
  pub fn from<T: AsRef<str>>(value: T) -> Option<Self> {
    let string = value.as_ref();

    serde_json::from_str(string).ok()
  }
}
