#[cfg(feature = "js")]
use wasm_bindgen::prelude::wasm_bindgen;

#[cfg(feature = "js")]
use tsify::declare;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[cfg(feature = "search")]
use fuse_rust::{FuseProperty, Fuseable};

#[cfg(feature = "internet")]
pub mod internet;

#[cfg(feature = "internet")]
pub use internet::*;

#[cfg(feature = "internet")]
pub mod methods;

#[cfg(feature = "internet")]
pub mod ahqstore;

#[cfg(feature = "internet")]
pub mod winget;

#[cfg(feature = "internet")]
pub mod flatpak;

#[cfg(feature = "internet")]
pub mod fdroid;

#[cfg(all(feature = "internet", feature = "search"))]
pub mod search;

use reqwest::{Client, ClientBuilder};
use std::sync::LazyLock;

pub static CLIENT: LazyLock<Client> = LazyLock::new(|| {
  ClientBuilder::new()
    .user_agent("AHQ Store Types / Rust / AHQ Softwares")
    .build()
    .unwrap()
});

#[cfg_attr(feature = "js", declare)]
pub type MapData = HashMap<String, String>;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HomeItem {
  pub ahqstore: Option<String>,
  pub winget: Option<String>,
  pub flatpak: Option<String>,
  pub fdroid: Option<String>,
}

impl HomeItem {
  pub fn get_id(self) -> Option<String> {
    if let Some(x) = self.ahqstore {
      return Some(x);
    }

    #[cfg(target_os = "windows")]
    return self.winget;

    #[cfg(target_os = "linux")]
    return self.flatpak;

    #[cfg(target_os = "android")]
    return self.fdroid;

    #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "android")))]
    return None;
  }
}

pub type RepoHomeData = Vec<(String, Vec<HomeItem>)>;
pub type HomeData = Vec<(String, Vec<String>)>;

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "js", wasm_bindgen(getter_with_clone))]
pub struct SearchEntry {
  pub name: String,
  pub title: String,
  pub id: String,
}

#[cfg(feature = "search")]
impl Fuseable for SearchEntry {
  fn properties(&self) -> Vec<FuseProperty> {
    vec![
      FuseProperty {
        value: "id".into(),
        weight: 0.34,
      },
      FuseProperty {
        value: "title".into(),
        weight: 0.33,
      },
      FuseProperty {
        value: "name".into(),
        weight: 0.33,
      },
    ]
  }

  fn lookup(&self, key: &str) -> Option<&str> {
    match key {
      "name" => Some(&self.name),
      "title" => Some(&self.title),
      "id" => Some(&self.id),
      _ => None,
    }
  }
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "js", wasm_bindgen(getter_with_clone))]
pub struct DevData {
  pub name: String,
  pub id: String,
  pub github: String,
  pub avatar_url: String,
}
