use std::{
  sync::mpsc::{channel, Sender},
  time::{Duration, SystemTime},
};

use ahqstore_types::{Command, ErrorType, Response, UpdateStatusReport};
use tokio::{spawn, time::sleep};

use crate::windows::utils::{get_iprocess, ws_send};

use super::{
  get_app, get_commit, get_prefs, list_apps, send_term,
  service::{download_app, get_app_url, install_app},
  uninstall_app,
};

pub static mut UPDATE_STATUS_REPORT: Option<UpdateStatusReport> = None;

fn time() -> u64 {
  SystemTime::now()
    .duration_since(SystemTime::UNIX_EPOCH)
    .unwrap()
    .as_secs()
}

pub fn get_install_daemon() -> Sender<Command> {
  let (tx, rx) = channel();

  spawn(async move {
    unsafe {
      UPDATE_STATUS_REPORT = Some(UpdateStatusReport::Disabled);
    }
    let should_autorun = get_prefs().auto_update_apps;
    let mut secs = time() + 600;
    let mut pending: Vec<Command> = vec![];

    let between = || sleep(Duration::from_millis(100));
    let run_update = || check_update();

    loop {
      'r: loop {
        if let Ok(data) = rx.try_recv() {
          pending.push(data);
        } else {
          break 'r;
        }
        between().await;
      }

      if time() > secs {
        if 0 == get_commit().await {
          secs = time() + 600;

          if should_autorun {
            run_update().await;
          }
        }
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
                ws_send(
                  &mut ws,
                  &Response::as_msg(Response::Installing(ref_id, app_id.clone())),
                )
                .await;

                between().await;
                if let None = install_app(x).await {
                  ws_send(
                    &mut ws,
                    &Response::as_msg(Response::Error(ErrorType::AppInstallError(ref_id, app_id))),
                  )
                  .await;
                } else {
                  ws_send(
                    &mut ws,
                    &Response::as_msg(Response::Installed(ref_id, app_id)),
                  )
                  .await;
                }
              } else {
                ws_send(
                  &mut ws,
                  &Response::as_msg(Response::Error(ErrorType::AppInstallError(ref_id, app_id))),
                )
                .await
              }
              send_term(ref_id).await;
            }
            Command::RunUpdate(ref_id) => {
              send_term(ref_id).await;
              run_update().await;
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

pub async fn check_update() {
  let mut to_update = vec![];

  unsafe {
    UPDATE_STATUS_REPORT = Some(UpdateStatusReport::Checking);
  }
  if let Some(x) = list_apps() {
    for (id, ver) in x {
      let app = get_app(0, id).await;
      match app {
        Response::AppData(_, id, app) => {
          if &ver != &app.version {
            to_update.push((id, app));
          }
        }
        _ => {}
      }
    }
  }

  let total: Vec<_> = to_update.iter().map(|(_, a)| a.appId.clone()).collect();

  for (id, app) in to_update {
    unsafe {
      UPDATE_STATUS_REPORT = Some(UpdateStatusReport::Updating(id, total.clone()));
    }

    let _ = uninstall_app(&app);
    let _ = install_app(app).await;
  }

  unsafe {
    UPDATE_STATUS_REPORT = Some(UpdateStatusReport::UpToDate);
  }
}
