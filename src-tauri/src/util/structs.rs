use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PayloadReq {
    pub module: String,
    pub data: Option<String>
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Req {
    pub token: String,
    pub module: String,
    pub data: Option<String>
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ServerResp {
    pub method: Option<String>,
    pub status: Option<String>,
    pub payload: Option<String>,
    pub ref_id: String,
    pub reason: Option<String>,
    pub auth: String
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ToSendResp {
    pub method: Option<String>,
    pub status: Option<String>,
    pub payload: Option<String>,
    pub ref_id: String,
    pub reason: Option<String>,
}

pub fn get_root() -> String {
    let root = std::env::var("SYSTEMROOT")
        .unwrap()
        .to_uppercase()
        .as_str()
        .replace("\\WINDOWS", "")
        .replace("\\Windows", "");

    return root;
}
