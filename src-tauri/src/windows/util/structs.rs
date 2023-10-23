use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PayloadReq {
  pub module: String,
  pub data: Option<String>,
  pub ref_id: u64
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ToSendResp {
  pub method: Option<String>,
  pub status: Option<String>,
  pub payload: Option<String>,
  pub ref_id: String,
  pub reason: Option<String>,
}
