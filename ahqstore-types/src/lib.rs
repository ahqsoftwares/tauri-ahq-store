use serde::{Deserialize, Serialize};
use serde_json::to_string_pretty;
use tokio_tungstenite::tungstenite::Message;

pub type AppId = String;
pub type Str = String;
pub type AppData = (String, String);

#[derive(Serialize, Deserialize, Debug)]
pub struct Prefs {}

#[derive(Serialize, Deserialize, Debug)]
pub struct AppRepo {
  pub author: Str,
  pub repo: Str,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct AHQStoreApplication {
  pub author: Str,
  pub description: Str,
  pub displayName: Str,
  pub download: Str,
  pub exe: Str,
  pub icon: Str,
  pub repo: AppRepo,
  pub title: Str,
  pub version: Str,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Command {
  GetApp(AppId),
  InstallApp(AppId),
  UninstallApp(AppId),

  ListApps,

  RunUpdate,
  UpdateStatus,

  GetPrefs,
  SetPrefs(Prefs),
}

impl Command {
  pub fn try_from<T: AsRef<str>>(value: T) -> Option<Self> {
    serde_json::from_str(value.as_ref()).ok()
  }
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Reason {
  UnknownData,

  Unauthenticated,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum ErrorType {
  GetAppFailed(AppId),
  AppInstallError(AppId),
  AppUninstallError(AppId),
  PrefsError,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Response {
  Ready,

  Error(ErrorType),

  Disconnect(Reason),

  AppData(AppId, AHQStoreApplication),

  ListApps(Vec<AppData>),

  DownloadStarted(AppId),
  DownloadProgress(AppId, u8),
  DownloadComplete(AppId),
  Installing(AppId),
  Installed(AppId),

  UninstallStarting(AppId),
  Uninstalled(AppId),

  Prefs(Prefs),
  PrefsSet,
}

impl Response {
  pub fn as_msg(msg: Self) -> Message {
    to_string_pretty(&msg).map_or_else(
      |_| Message::Text("\"ERR\"".to_string()),
      |x| Message::Text(x),
    )
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