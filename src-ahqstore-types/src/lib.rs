use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string, to_string_pretty};
use std::fs::read;

#[cfg(feature = "js")]
use kfghdfghdfkgh_js_macros::TsifyAsync;
#[cfg(feature = "js")]
use tsify::*;
#[cfg(feature = "js")]
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

#[cfg_attr(feature = "js", declare)]
pub type AppId = String;
#[cfg_attr(feature = "js", declare)]
pub type Str = String;
#[cfg_attr(feature = "js", declare)]
pub type AppData = (String, String);
#[cfg_attr(feature = "js", declare)]
pub type RefId = u64;

pub mod app;
pub use app::*;

pub mod api;
pub use api::*;

pub mod data;
pub use data::*;

pub mod winget;

/// **You should use cli**
/// ```sh
/// cargo install ahqstore_cli_rs
/// ```
/// or visit app / api sub module
///
/// This Module:
/// This module lists the standard commands & types that AHQ Store sends to AHQ Store Service

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "js", wasm_bindgen(getter_with_clone))]
pub struct Commit {
  pub sha: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "js", wasm_bindgen)]
pub struct Prefs {
  pub launch_app: bool,
  pub install_apps: bool,
  pub auto_update_apps: bool,
}

#[cfg_attr(feature = "js", wasm_bindgen)]
impl Prefs {
  pub fn get(path: &str) -> Option<Vec<u8>> {
    read(&path).ok()
  }

  pub fn str_to(s: &str) -> Option<Prefs> {
    from_str(s).ok()
  }

  pub fn convert(&self) -> Option<String> {
    to_string(self).ok()
  }

  pub fn default() -> Prefs {
    Prefs {
      launch_app: true,
      install_apps: true,
      auto_update_apps: true,
    }
  }
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "js", derive(Tsify, TsifyAsync))]
#[cfg_attr(feature = "js", tsify(into_wasm_abi, from_wasm_abi))]
pub enum Package {
  LeadLang,
  DevCamp,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "js", derive(Tsify, TsifyAsync))]
#[cfg_attr(feature = "js", tsify(into_wasm_abi, from_wasm_abi))]
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

#[cfg_attr(feature = "js", wasm_bindgen)]
impl Command {
  pub fn try_from_js(value: String) -> Option<Command> {
    serde_json::from_str(&value).ok()
  }
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "js", derive(Tsify, TsifyAsync))]
#[cfg_attr(feature = "js", tsify(into_wasm_abi, from_wasm_abi))]
pub enum Reason {
  UnknownData(RefId),

  Unauthenticated,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "js", derive(Tsify, TsifyAsync))]
#[cfg_attr(feature = "js", tsify(into_wasm_abi, from_wasm_abi))]
pub enum ErrorType {
  GetAppFailed(RefId, AppId),
  AppPlatformNoSupport(RefId, AppId),
  AVBlockedApp(RefId, AppId),
  PrefsError(RefId),
  PkgError(RefId),
  GetSHAFailed(RefId),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[cfg_attr(feature = "js", derive(Tsify, TsifyAsync))]
#[cfg_attr(feature = "js", tsify(into_wasm_abi, from_wasm_abi))]
pub struct Library {
  pub app_id: String,
  pub status: AppStatus,
  pub is_update: bool,
  pub to: ToDo,
  pub progress: f64,
  pub max: u64,
  pub app: Option<AHQStoreApplication>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[cfg_attr(feature = "js", derive(Tsify, TsifyAsync))]
#[cfg_attr(feature = "js", tsify(into_wasm_abi, from_wasm_abi))]
pub enum ToDo {
  Install,
  Uninstall,
}

#[derive(Debug, Deserialize, Clone)]
#[cfg_attr(feature = "js", derive(Tsify, TsifyAsync))]
#[cfg_attr(feature = "js", tsify(into_wasm_abi, from_wasm_abi))]
pub enum AppStatus {
  Pending,
  Downloading,
  AVScanning,
  Installing,
  Uninstalling,
  InstallSuccessful,
  UninstallSuccessful,
  NotSuccessful,
  AVFlagged,
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
      AppStatus::AVScanning => "Scanning for Viruses!",
      AppStatus::AVFlagged => "Flagged as Malicious!",
    })
  }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[cfg_attr(feature = "js", derive(Tsify, TsifyAsync))]
#[cfg_attr(feature = "js", tsify(into_wasm_abi, from_wasm_abi))]
pub enum UpdateStatusReport {
  Disabled,
  UpToDate,
  Checking,
  Updating,
}

impl Clone for Commits {
  fn clone(&self) -> Self {
    Self {
      ahqstore: self.ahqstore.clone(),
      winget: self.winget.clone(),
    }
  }
}

impl From<&Commits> for Commits {
  fn from(value: &Commits) -> Self {
      value.clone()
  }
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "js", derive(Tsify, TsifyAsync))]
#[cfg_attr(feature = "js", tsify(into_wasm_abi, from_wasm_abi))]
pub enum ResponseToSend {
  Ready,

  Error(ErrorType),

  SHAId(RefId, Commits),

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

#[cfg_attr(feature = "js", wasm_bindgen)]
impl ResponseToSend {
  pub fn as_msg(msg: ResponseToSend) -> Vec<u8> {
    to_string_pretty(&msg)
      .unwrap_or("ERRR".to_string())
      .into_bytes()
  }
}

pub type Response = ResponseToSend;

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
