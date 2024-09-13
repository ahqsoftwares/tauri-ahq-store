#[cfg(feature = "js")]
use wasm_bindgen::prelude::wasm_bindgen;

#[cfg(feature = "js")]
use tsify::declare;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[cfg(feature = "internet")]
pub mod internet;
#[cfg(feature = "internet")]
pub use internet::*;

#[cfg_attr(feature = "js", wasm_bindgen(getter_with_clone))]
pub struct ServerJSONResp {
  pub last_updated: u64,
  pub config: String,
}

#[cfg_attr(feature = "js", declare)]
pub type MapData = HashMap<String, String>;

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "js", wasm_bindgen(getter_with_clone))]
pub struct SearchEntry {
  pub name: String,
  pub title: String,
  pub id: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[cfg_attr(feature = "js", wasm_bindgen(getter_with_clone))]
pub struct DevData {
  pub name: String,
  pub id: String,
  pub github: String,
  pub avatar_url: String,
}