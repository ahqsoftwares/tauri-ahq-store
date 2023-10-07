use serde::{Deserialize, Serialize};
use serde_json::to_string_pretty;
use tokio_tungstenite::tungstenite::Message;

pub type AppId = String;
pub type Str = String;
pub type AppData = (String, String);
pub type RefId = u64;

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
  GetApp(RefId, AppId),
  InstallApp(RefId, AppId),
  UninstallApp(RefId, AppId),

  ListApps(RefId),

  RunUpdate(RefId),
  UpdateStatus(RefId),

  GetPrefs(RefId),
  SetPrefs(RefId, Prefs),
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
  AppInstallError(RefId, AppId),
  AppUninstallError(RefId, AppId),
  PrefsError(RefId),
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Response {
  Ready,

  Error(ErrorType),

  Disconnect(Reason),

  AppData(RefId, AppId, AHQStoreApplication),

  ListApps(RefId, Vec<AppData>),

  DownloadStarted(RefId, AppId),
  DownloadProgress(RefId, AppId, u8),
  Installing(RefId, AppId),
  Installed(RefId, AppId),

  UninstallStarting(RefId, AppId),
  Uninstalled(RefId, AppId),

  Prefs(RefId, Prefs),
  PrefsSet(RefId),

  TerminateBlock(RefId)
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
