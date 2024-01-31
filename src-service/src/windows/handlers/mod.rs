use lazy_static::lazy_static;
use std::sync::mpsc::Sender;
use tokio::spawn;
use tokio::{io::AsyncWriteExt, net::windows::named_pipe::NamedPipeServer};

use crate::windows::{
  utils::{
    get_iprocess,
    structs::{Command, ErrorType, Reason, Response},
  },
  write_log,
};

use self::service::*;

mod daemon;
mod service;

lazy_static! {
  static ref GET_INSTALL_DAEMON: Sender<Command> = daemon::get_install_daemon();
}

pub use self::service::keep_alive;

use super::utils::ws_send;

pub fn handle_msg(data: String) {
  spawn(async move {
    if let Some(mut ws) = get_iprocess() {
      let stop = |ws: &NamedPipeServer| {
        let _ = ws.disconnect();
      };
      if let Some(x) = Command::try_from(&data) {
        match x {
          Command::GetApp(ref_id, app_id) => {
            let _ = GET_INSTALL_DAEMON.send(Command::GetApp(ref_id, app_id));
          }
          Command::InstallApp(ref_id, app_id) => {
            let _ = GET_INSTALL_DAEMON.send(Command::InstallApp(ref_id, app_id));
          }
          Command::UninstallApp(ref_id, app_id) => {
            let msg = Response::as_msg(Response::UninstallStarting(ref_id, app_id.clone()));

            ws_send(&mut ws, &msg).await;

            let app_data = get_app(ref_id, app_id.clone()).await;
            match app_data {
              Response::AppData(_, id, data) => {
                let msg = uninstall_app(&data).map_or_else(
                  || Response::as_msg(Response::Error(ErrorType::AppUninstallError(ref_id, id))),
                  |id| Response::as_msg(Response::Uninstalled(ref_id, id)),
                );
                ws_send(&mut ws, &msg).await;
              }
              _ => {
                let msg = Response::as_msg(Response::Error(ErrorType::AppUninstallError(
                  ref_id, app_id,
                )));

                ws_send(&mut ws, &msg).await;
              }
            }
            send_term(ref_id).await;
          }

          Command::ListApps(ref_id) => {
            write_log("Acknowledged");
            if let Some(x) = list_apps() {
              let val = Response::as_msg(Response::ListApps(ref_id, x));

              ws_send(&mut ws, &val).await;

              write_log("Acknowledged (Sent)");
            }
            send_term(ref_id).await;
            write_log("Acknowledged (END)");
          }

          Command::GetPrefs(ref_id) => {
            let val = Response::as_msg(Response::Prefs(ref_id, get_prefs()));

            ws_send(&mut ws, &val).await;

            send_term(ref_id).await;
          }
          Command::SetPrefs(ref_id, prefs) => {
            let val = if let Some(_) = set_prefs(prefs) {
              Response::as_msg(Response::PrefsSet(ref_id))
            } else {
              Response::as_msg(Response::Error(ErrorType::PrefsError(ref_id)))
            };

            ws_send(&mut ws, &val).await;
            send_term(ref_id).await;
          }

          Command::RunUpdate(ref_id) => {
            send_term(ref_id).await;
          }
          Command::UpdateStatus(ref_id) => {
            send_term(ref_id).await;
          }

          _ => {}
        }
        let _ = ws.flush().await;
      } else {
        let x = Response::as_msg(Response::Disconnect(Reason::UnknownData(0)));
        ws_send(&mut ws, &x).await;

        let _ = ws.disconnect();
        stop(&ws);
      }
    } else {
      write_log("STOPPING: Critical Error!");
      panic!("Critical Error!");
    }
  });
}

pub async fn send_term(ref_id: u64) {
  if let Some(mut ws) = get_iprocess() {
    let x = Response::as_msg(Response::TerminateBlock(ref_id));

    ws_send(&mut ws, &x).await;
  }
}
