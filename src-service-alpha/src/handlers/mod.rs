use futures_util::SinkExt;
use tokio::spawn;

use crate::utils::{
  get_ws,
  structs::{Command, ErrorType, Reason, Response},
};

use self::service::*;

mod service;

pub use self::service::keep_alive;

pub fn handle_msg(data: String, stop: fn()) {
  spawn(async move {
    if let Some(ws) = get_ws() {
      if let Some(x) = Command::try_from(&data) {
        match x {
          Command::GetApp(app_id) => {
            let app_data = get_app(app_id).await;
            let x = Response::as_msg(app_data);
            let _ = ws.send(x).await;
          }
          Command::InstallApp(app_id) => {
            if let Some(x) = download_app(&app_id).await {
              let _ = ws
                .send(Response::as_msg(Response::Installing(app_id.clone())))
                .await;
              install_app(app_id.clone(), x);
              let _ = ws.send(Response::as_msg(Response::Installed(app_id))).await;
            }
          }
          Command::UninstallApp(app_id) => {
            let msg = Response::as_msg(Response::UninstallStarting(app_id.clone()));

            let _ = ws.send(msg).await;

            let app_data = get_app(app_id.clone()).await;
            match app_data {
              Response::AppData(id, data) => {
                let msg = uninstall_app(id.clone(), data.title).map_or_else(
                  || Response::as_msg(Response::Error(ErrorType::AppUninstallError(id))),
                  |id| Response::as_msg(Response::Uninstalled(id)),
                );
                let _ = ws.send(msg).await;
              }
              _ => {
                let msg = Response::as_msg(Response::Error(ErrorType::AppUninstallError(app_id)));

                let _ = ws.send(msg).await;
              }
            }
          }

          Command::ListApps => {
            if let Some(x) = list_apps() {
              let _ = ws.send(Response::as_msg(Response::ListApps(x))).await;
            }
          }

          Command::GetPrefs => {}
          Command::SetPrefs(_) => {}

          Command::RunUpdate => {}
          Command::UpdateStatus => {}
        }
        let _ = ws.flush().await;
      } else {
        let x = Response::as_msg(Response::Disconnect(Reason::UnknownData));
        let _ = ws.send(x).await;

        let _ = ws.flush().await;
        let _ = ws.close().await;
        stop();
      }
    } else {
      stop();
    }
  });
}
