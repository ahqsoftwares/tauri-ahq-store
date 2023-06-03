use crate::auth;

use serde::{Deserialize, Serialize};
use serde_json::from_str;

use ws::{CloseCode, Message, Sender};

mod get;
mod install;
mod uninstall;
mod update;

#[derive(Deserialize, Serialize)]
struct WsMessage {
    module: String,
    token: String,
    data: String,
}

pub fn handle_ws(msg: Message, out: Sender) {
    let mut out = out;

    if let Ok(txt) = msg.as_text() {
        if let Ok(json) = from_str::<WsMessage>(txt) {
            if !auth::verify_pwd(&json.token) {
                send_invalid(r#""Invalid Token""#, &mut out);
            } else {
                match json.module.as_str() {
                    "APPS" => {}
                    "INSTALL" => {}
                    "UNINSTALL" => {}
                    "UPDATE" => {}
                    "CHECKUPDATE" => {}
                    _ => send_invalid(r#""Invalid Method""#, &mut out),
                }
            }
        } else {
            send_invalid(r#""Invalid JSON""#, &mut out);
        }
    } else {
        send_invalid(r#""Invalid Format""#, &mut out);
    }
}

fn send_invalid(reason: &str, out: &mut Sender) {
    out.close_with_reason(CloseCode::Invalid, reason.to_owned())
        .unwrap_or(());
}
