use serde::{Deserialize, Serialize};

pub static GITHACK: &str =
    "https://rawcdn.githack.com/ahqsoftwares/ahq-store-data/[sha]/database/[file]";

pub static APPS_FOLDER: &str = "\\ProgramData\\AHQ Store Applications\\Programs";
pub static INSTALLER_FOLDER: &str = "\\ProgramData\\AHQ Store Applications\\Installers";
pub static DESKTOP_FOLDER: &str = "\\Users\\Public\\Desktop\\[app].lnk";
pub static START_FOLDER: &str =
    "\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\AHQ Store\\[app].lnk";

#[derive(Clone, Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct Author {
    pub email: String,
    pub displayName: String,
    pub apps: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Repo {
    pub author: String,
    pub repo: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct RawApp {
    pub id: String,
    pub version: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct GithubApp {
    pub author: String,
    pub description: String,
    pub download: String,
    pub exe: String,
    pub icon: String,
    pub repo: Repo,
    pub title: String,
    pub displayName: String,
    pub version: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct App {
    pub id: String,
    pub app: GithubApp,
}

#[derive(Debug, Clone)]
pub struct AppDownloaded {
    pub url: String,
    pub exec: String,
    pub name: String,
    pub version: String,
}

pub fn get_root() -> String {
    let root = std::env::var("SYSTEMROOT")
        .unwrap()
        .to_uppercase()
        .as_str()
        .replace("\\WINDOWS", "")
        .replace("\\Windows", "");

    return root;
}
