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
          Command::GetApp(ref_id, app_id) => {
            let app_data = get_app(ref_id, app_id).await;
            let x = Response::as_msg(app_data);
            let _ = ws.send(x).await;

            send_term(ref_id).await;
          }
          Command::InstallApp(ref_id, app_id) => {
            if let Some(x) = download_app(ref_id, &app_id).await {
              let _ = ws
                .send(Response::as_msg(Response::Installing(
                  ref_id,
                  app_id.clone(),
                )))
                .await;
              install_app(app_id.clone(), x);
              let _ = ws
                .send(Response::as_msg(Response::Installed(ref_id, app_id)))
                .await;
            }
            send_term(ref_id).await;
          }
          Command::UninstallApp(ref_id, app_id) => {
            let msg = Response::as_msg(Response::UninstallStarting(ref_id, app_id.clone()));

            let _ = ws.send(msg).await;

            let app_data = get_app(ref_id, app_id.clone()).await;
            match app_data {
              Response::AppData(_, id, data) => {
                let msg = uninstall_app(id.clone(), data.title).map_or_else(
                  || Response::as_msg(Response::Error(ErrorType::AppUninstallError(ref_id, id))),
                  |id| Response::as_msg(Response::Uninstalled(ref_id, id)),
                );
                let _ = ws.send(msg).await;
              }
              _ => {
                let msg = Response::as_msg(Response::Error(ErrorType::AppUninstallError(
                  ref_id, app_id,
                )));

                let _ = ws.send(msg).await;
              }
            }
            send_term(ref_id).await;
          }

          Command::ListApps(ref_id) => {
            if let Some(x) = list_apps() {
              let _ = ws
                .send(Response::as_msg(Response::ListApps(ref_id, x)))
                .await;
            }
            send_term(ref_id).await;
          }

          Command::GetPrefs(ref_id) => {
            if let Some(prefs) = get_prefs() {
              let _ = ws
                .send(Response::as_msg(Response::Prefs(ref_id, prefs)))
                .await;
            } else {
              let _ = ws.send(Response::as_msg(Response::Error(ErrorType::PrefsError(
                ref_id,
              ))));
            }
            send_term(ref_id).await;
          }
          Command::SetPrefs(ref_id, prefs) => {
            if let Some(_) = set_prefs(prefs) {
              let _ = ws.send(Response::as_msg(Response::PrefsSet(ref_id))).await;
            } else {
              let _ = ws.send(Response::as_msg(Response::Error(ErrorType::PrefsError(
                ref_id,
              ))));
            }
            send_term(ref_id).await;
          }

          Command::RunUpdate(ref_id) => {
            send_term(ref_id).await;
          }
          Command::UpdateStatus(ref_id) => {
            send_term(ref_id).await;
          }
        }
        let _ = ws.flush().await;
      } else {
        let x = Response::as_msg(Response::Disconnect(Reason::UnknownData(0)));
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

async fn send_term(ref_id: u64) {
  if let Some(ws) = get_ws() {
    let x = Response::as_msg(Response::TerminateBlock(ref_id));

    let _ = ws.send(x).await;
  }
}
