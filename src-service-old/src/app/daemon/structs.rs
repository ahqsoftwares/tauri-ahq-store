use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalPreferences {
  launch_app: bool,
  install_apps: bool,
}

impl Default for GlobalPreferences {
  fn default() -> Self {
    Self {
      install_apps: true,
      launch_app: true,
    }
  }
}

pub enum Preferences {
  Struct(GlobalPreferences),
  Data(String),
}
