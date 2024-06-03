#![allow(unused)]

use ahqstore_types::UpdateStatusReport;
use lazy_static::lazy_static;
use std::sync::mpsc::Sender;

#[allow(unused)]
use tokio::{io::AsyncWriteExt, spawn};

use crate::{
  utils::{
    get_iprocess,
    structs::{Command, ErrorType, Reason, Response},
  },
  write_log,
};

use self::daemon::{lib_msg, UPDATE_STATUS_REPORT};
use self::service::*;

mod daemon;
mod service;

pub use self::service::init;

lazy_static! {
  pub static ref GET_INSTALL_DAEMON: Sender<Command> = daemon::get_install_daemon();
}

use super::utils::ws_send;

pub fn handle_msg(data: String) {
  spawn(async move {
    if let Some(mut ws) = get_iprocess() {
      if let Some(x) = Command::try_from(&data) {
        match x {
          Command::GetSha(ref_id) => unsafe {
            let val = if let Some(x) = GH_URL.as_ref() {
              Response::as_msg(Response::SHAId(ref_id, x.into()))
            } else {
              Response::as_msg(Response::Error(ErrorType::GetSHAFailed(ref_id)))
            };

            ws_send(&mut ws, &val).await;
            send_term(ref_id).await;
          },
          Command::GetApp(ref_id, app_id) => {
            let _ = GET_INSTALL_DAEMON.send(Command::GetApp(ref_id, app_id));
          }
          Command::InstallApp(ref_id, app_id) => {
            let _ = GET_INSTALL_DAEMON.send(Command::InstallApp(ref_id, app_id));
          }
          Command::UninstallApp(ref_id, app_id) => {
            let msg = Response::as_msg(Response::Acknowledged(ref_id));

            ws_send(&mut ws, &msg).await;
            let _ = GET_INSTALL_DAEMON.send(Command::UninstallApp(ref_id, app_id));
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
            let _ = GET_INSTALL_DAEMON.send(Command::RunUpdate(ref_id));
          }
          Command::UpdateStatus(ref_id) => {
            println!("Sending UP STATUS");
            let _ = ws_send(
              &mut ws,
              &Response::as_msg(Response::UpdateStatus(ref_id, unsafe {
                UPDATE_STATUS_REPORT
                  .as_ref()
                  .unwrap_or(&UpdateStatusReport::Checking)
                  .clone()
              })),
            )
            .await;
            send_term(ref_id).await;
          }
          Command::GetLibrary(ref_id) => {
            println!("Getting Library!");
            ws_send(&mut ws, &lib_msg()).await;
            send_term(ref_id).await;
          }
          Command::AddPkg(ref_id, _pkg) => {
            send_term(ref_id).await;
          }
        }
      } else {
        let x = Response::as_msg(Response::Disconnect(Reason::UnknownData(0)));
        ws_send(&mut ws, &x).await;

        #[cfg(windows)]
        let _ = ws.disconnect();

        #[cfg(unix)]
        let _ = ws.shutdown().await;
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
