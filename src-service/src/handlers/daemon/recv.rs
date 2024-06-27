use ahqstore_types::{AppStatus, Command, Library, Response, ToDo};
use std::sync::mpsc::Receiver;

use crate::{
  handlers::get_app,
  utils::{ws_send, ServiceIpc},
};

use super::{lib_msg, BETWEEN};

pub async fn recv(
  rx: &mut Receiver<Command>,
  pending: &mut Vec<Library>,
  run_update_now: &mut bool,
) -> bool {
  let mut found = false;
  'r: loop {
    if let Ok(data) = rx.try_recv() {
      match data {
        Command::InstallApp(_, app_id) => {
          pending.push(Library {
            app_id,
            is_update: false,
            status: AppStatus::Pending,
            to: ToDo::Install,
            progress: 0.0,
            max: 0,
            app: None,
          });
        }
        Command::UninstallApp(ref_id, app_id) => {
          if let Response::AppData(_, app_id, app) = get_app(ref_id, app_id).await {
            pending.push(Library {
              app_id,
              is_update: false,
              app: Some(app),
              progress: 0.0,
              max: 0,
              status: AppStatus::Pending,
              to: ToDo::Uninstall,
            });
          }
        }
        Command::RunUpdate(_) => {
          *run_update_now = true;
        }
        _ => {}
      }
      found = true;
    } else {
      break 'r;
    }
    BETWEEN().await;
  }

  found
}
