use futures_util::SinkExt;
use tokio::spawn;

use crate::utils::{
    get_ws,
    structs::{Command, Reason, Response},
};

use self::service::*;

mod service;

pub fn handle_msg(data: String, stop: fn()) {
    spawn(async move {
        if let Some(ws) = get_ws() {
            if let Some(x) = Command::try_from(&data) {
                match x {
                    Command::GetApp(app_id) => {
                        let app_data = get_app(app_id).await;
                        if let Some(x) = Response::as_msg(app_data) {
                            let _ = ws.send(x).await;
                        }
                    }
                    Command::InstallApp(_) => {}
                    Command::UninstallApp(_) => {}

                    Command::GetPrefs => {}
                    Command::SetPrefs(_) => {}

                    Command::RunUpdate => {}
                    Command::UpdateStatus => {}
                }
                let _ = ws.flush().await;
            } else {
                if let Some(x) = Response::as_msg(Response::Disconnect(Reason::UnknownData)) {
                    let _ = ws.send(x).await;
                }

                let _ = ws.flush().await;
                let _ = ws.close().await;
                stop();
            }
        } else {
            stop();
        }
    });
}
