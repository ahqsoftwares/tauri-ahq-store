use std::sync::LazyLock;

pub static AHQSTORE_COMMIT_URL: &'static str = "https://api.github.com/repos/ahqstore/apps/commits";
pub static AHQSTORE_BASE_URL: &'static str = "https://rawcdn.githack.com/ahqstore/apps/{COMMIT}";

pub static AHQSTORE_APP_URL: LazyLock<String> =
  LazyLock::new(|| format!("{AHQSTORE_BASE_URL}/db/apps/{{APP_ID}}.json"));
pub static AHQSTORE_APP_ASSET_URL: LazyLock<String> =
  LazyLock::new(|| format!("{AHQSTORE_BASE_URL}/db/res/{{APP_ID}}/{{ASSET}}"));

pub static AHQSTORE_TOTAL: LazyLock<String> =
  LazyLock::new(|| format!("{AHQSTORE_BASE_URL}/db/total"));
pub static AHQSTORE_HOME: LazyLock<String> =
  LazyLock::new(|| format!("{AHQSTORE_BASE_URL}/db/home.json"));

pub static AHQSTORE_SEARCH: LazyLock<String> =
  LazyLock::new(|| format!("{AHQSTORE_BASE_URL}/db/search/{{ID}}.json"));
pub static AHQSTORE_MAP: LazyLock<String> =
  LazyLock::new(|| format!("{AHQSTORE_BASE_URL}/db/map/{{ID}}.json"));

pub static AHQSTORE_APPS_DEV: LazyLock<String> =
  LazyLock::new(|| format!("{AHQSTORE_BASE_URL}/db/dev/{{ID}}.json"));
pub static AHQSTORE_DEV_DATA: LazyLock<String> =
  LazyLock::new(|| format!("{AHQSTORE_BASE_URL}/users/{{ID}}.json"));
