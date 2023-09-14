use serde::{Deserialize, Serialize};

pub type AppId = String;

#[derive(Serialize, Deserialize, Debug)]
pub struct Prefs {}

#[derive(Serialize, Deserialize, Debug)]
pub enum Data {
    GetApp(AppId),
    InstallApp(AppId),
    UninstallApp(AppId),

    RunUpdate,
    UpdateStatus,

    GetPrefs,
    SetPrefs(Prefs),
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
