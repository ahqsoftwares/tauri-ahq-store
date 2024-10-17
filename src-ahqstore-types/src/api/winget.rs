//! Declared URLS for:
//! AHQ Store WinGet Repo Parsable Urls (microsoft/winget-pkgs mirror)
//!
//! Repository Mirror : <https://github.com/ahqstore/ahqstore-winget-pkgs>
//! Thanks to winget-pkgs@microsoft for providing the data

use std::sync::LazyLock;

pub static WINGET_COMMIT_URL: &'static str =
  "https://api.github.com/repos/ahqstore/ahqstore-winget-pkgs/commits";
pub static WINGET_BASE_URL: &'static str =
  "https://rawcdn.githack.com/ahqstore/ahqstore-winget-pkgs/{COMMIT}";

pub static WINGET_APP_URL: LazyLock<String> =
  LazyLock::new(|| format!("{WINGET_BASE_URL}/db/apps/{{APP_ID}}.json"));
pub static WINGET_APP_ASSET_URL: LazyLock<String> =
  LazyLock::new(|| format!("{WINGET_BASE_URL}/db/res/{{APP_ID}}/{{ASSET}}"));

pub static WINGET_TOTAL: LazyLock<String> = LazyLock::new(|| format!("{WINGET_BASE_URL}/db/total"));

pub static WINGET_SEARCH: LazyLock<String> =
  LazyLock::new(|| format!("{WINGET_BASE_URL}/db/search/{{ID}}.json"));
pub static WINGET_MAP: LazyLock<String> =
  LazyLock::new(|| format!("{WINGET_BASE_URL}/db/map/{{ID}}.json"));

pub static WINGET_APPS_DEV: LazyLock<String> =
  LazyLock::new(|| format!("{WINGET_BASE_URL}/db/dev/{{ID}}.json"));
pub static WINGET_DEV_DATA: LazyLock<String> =
  LazyLock::new(|| format!("{WINGET_BASE_URL}/users/{{ID}}.json"));
