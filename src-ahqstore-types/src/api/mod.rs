#[cfg(feature = "internet")]
pub mod internet;
#[cfg(feature = "internet")]
pub use internet::*;

pub struct ServerJSONResp {
  pub last_updated: u64,
  pub config: String,
}
