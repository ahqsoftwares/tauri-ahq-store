use std::{
  sync::mpsc::{channel, Sender},
  time::Duration,
};

use ahqstore_types::{Command, Response, ErrorType};
use tokio::{spawn, time::sleep};

use crate::windows::utils::{get_iprocess, write_log, ws_send};

use super::{
  send_term,
  service::{download_app, get_app_url, install_app},
};


pub fn get_install_daemon() -> Sender<Command> {
  let (tx, rx) = channel();

  spawn(async move {
    let mut pending: Vec<Command> = vec![];

    let between = || sleep(Duration::from_millis(100));

    loop {
      'r: loop {
        if let Ok(data) = rx.try_recv() {
          pending.push(data);
        } else {
          break 'r;
        }
        between().await;
      }

      if let Some(mut ws) = get_iprocess() {
        for cmd in pending {
          match cmd {
            Command::GetApp(ref_id, app_id) => {
              let app_data = get_app_url(ref_id, app_id).await;
              let x = Response::as_msg(app_data);
              ws_send(&mut ws, &x).await;

              send_term(ref_id).await;
            }
            Command::InstallApp(ref_id, app_id) => {
              if let Some(x) = download_app(ref_id, &app_id).await {
                between().await;
                ws_send(&mut ws, &Response::as_msg(Response::Installing(
                  ref_id,
                  app_id.clone(),
                ))).await;

                between().await;
                if let None = install_app(x).await {
                  ws_send(&mut ws, &Response::as_msg(Response::Error(ErrorType::AppInstallError(ref_id, app_id)))).await;
                } else {
                  ws_send(&mut ws, &Response::as_msg(Response::Installed(ref_id, app_id))).await;
                }
              } else {
                ws_send(&mut ws, &Response::as_msg(Response::Error(ErrorType::AppInstallError(ref_id, app_id)))).await
              }
              send_term(ref_id).await;
            }
            _ => {}
          }

          between().await;
        }
        pending = vec![];
      }

      between().await;
    }
  });

  tx
}
