use crate::Str;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub mod install;
mod other_fields;

pub use install::*;
pub use other_fields::*;

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct AHQStoreApplication {
  //Deprecated
  #[deprecated = "Overriden by vNext"]
  pub title: Str,
  #[deprecated = "Overriden by vNext"]
  pub author: Str,
  #[deprecated = "Overriden by vNext"]
  pub download: Str,
  #[deprecated = "Overriden by vNext"]
  pub exe: Str,

  // vNext
  #[doc = "🔬 vNext Specification"]
  pub appId: Option<Str>,
  #[doc = "🔬 vNext Specification"]
  pub appInstalledName: Option<Str>,
  #[doc = "🔬 vNext Specification"]
  pub authorId: Option<Str>,
  #[doc = "🔬 vNext Specification"]
  pub downloadUrls: Option<HashMap<u8, DownloadUrl>>,
  #[doc = "🔬 vNext Specification"]
  pub install: Option<InstallerOptions>,

  // <-- no change -->
  pub description: Str,
  pub icon: Str,
  pub repo: AppRepo,
  pub version: Str,
}

// pub struct AHQStoreApplication {
//   *pub author: Str,
//   *pub description: Str,
//   *pub displayName: Str,
//   *pub download: Str,
//   *pub exe: Str,
//   *pub icon: Str,
//   *pub repo: AppRepo,
//   *pub title: Str,
//   *pub version: Str,
// }
