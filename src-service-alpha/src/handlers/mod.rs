use futures_util::SinkExt;
use tokio::spawn;

use crate::utils::{
    get_ws,
    structs::{Command, Response},
};

mod service;

pub fn handle_msg(data: String, stop: fn()) {
    spawn(async move {
        if let Some(ws) = get_ws() {
            if let Some(x) = Command::try_from(&data) {
                match x {
                    Command::GetApp(_) => {}
                    Command::InstallApp(_) => {}
                    Command::UninstallApp(_) => {}

                    Command::GetPrefs => {}
                    Command::SetPrefs(_) => {}

                    Command::RunUpdate => {}
                    Command::UpdateStatus => {}
                }
            } else {
                if let Some(x) = Response::as_msg(Response::UnknownData) {
                    let _ = ws.send(x).await;
                }

                let _ = ws.close().await;
                stop();
            }
        } else {
            stop();
        }
    });
}
