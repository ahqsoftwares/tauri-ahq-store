use std::sync::LazyLock;

pub static WINGET_COMMIT_URL: &'static str = "https://api.github.com/repos/ahqstore/apps/commits";
pub static WINGET_BASE_URL: &'static str = "https://rawcdn.githack.com/ahqstore/apps/{COMMIT}";

pub static WINGET_APP_URL: LazyLock<String> =
  LazyLock::new(|| format!("{WINGET_BASE_URL}/db/apps/{{APP_ID}}.json"));
pub static WINGET_APP_ASSET_URL: LazyLock<String> =
  LazyLock::new(|| format!("{WINGET_BASE_URL}/db/res/{{APP_ID}}/{{ASSET}}"));

pub static WINGET_TOTAL: LazyLock<String> = LazyLock::new(|| format!("{WINGET_BASE_URL}/db/total"));
pub static WINGET_HOME: LazyLock<String> = LazyLock::new(|| format!("{WINGET_BASE_URL}/db/home.json"));

pub static WINGET_SEARCH: LazyLock<String> = LazyLock::new(|| format!("{WINGET_BASE_URL}/db/search/{{ID}}.json"));
pub static WINGET_MAP: LazyLock<String> = LazyLock::new(|| format!("{WINGET_BASE_URL}/db/map/{{ID}}.json"));

pub static WINGET_APPS_DEV: LazyLock<String> = LazyLock::new(|| format!("{WINGET_BASE_URL}/db/dev/{{ID}}.json"));
pub static WINGET_DEV_DATA: LazyLock<String> = LazyLock::new(|| format!("{WINGET_BASE_URL}/users/{{ID}}.json"));