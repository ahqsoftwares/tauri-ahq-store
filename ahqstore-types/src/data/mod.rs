use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize, Debug)]
pub struct DeveloperUser {
  /// The Name of the Developer
  name: String,

  /// A short description of the author[^1]
  /// 
  /// [^1]: Maximum 128 words
  description: String,

  /// The GitHub username of the user
  gh_username: String,

  /// The base64 version of the user's icon
  icon_base64: Option<String>,

  /// No user can be ahq_official except @ahqsoftwares
  ahq_official: bool,

  /// The public email of the user
  email: String,

  #[doc = "🔬 v2 Schema\n\n"]
  support: String,

  /// The list of apps published by the user
  apps: Vec<String>
}
