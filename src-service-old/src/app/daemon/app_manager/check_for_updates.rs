use reqwest::blocking::Client;
use std::sync::mpsc::Sender;

use super::{get_apps, list_apps, App};
use crate::app::daemon::runner::{Status, UpdateStatus};

pub fn check_for_updates(
  client: Client,
  commit_id: String,
  tx: Sender<String>,
  update_status: &mut UpdateStatus,
  callback: &dyn Fn(UpdateStatus, Sender<String>) -> (),
) {
  let installed = list_apps();

  let apps = get_apps(
    installed.clone().iter().map(|app| app.clone().id).collect(),
    client,
    commit_id,
  );

  let status = UpdateStatus {
    status: Status::Checking,
    updating: vec![],
  };

  callback(status.clone(), tx.clone());
  *update_status = status;

  let mut needs_update = vec![];

  let mut index = 0;
  for app in installed {
    let online = &apps[index];

    if &app.version != &online.app.version {
      needs_update.push(online.clone());
    }

    index += 1;
  }

  let status = UpdateStatus {
    status: if needs_update.clone().len() > 0 {
      Status::Updating
    } else {
      Status::UpToDate
    },
    updating: needs_update
      .clone()
      .iter()
      .map(|app| app.id.clone())
      .collect::<Vec<String>>(),
  };

  callback(status.clone(), tx.clone());
  *update_status = status;

  if needs_update.clone().len() > 0 {
    update(needs_update);

    let status = UpdateStatus {
      status: Status::UpToDate,
      updating: vec![],
    };

    callback(status.clone(), tx.clone());
    *update_status = status;
  }
}

fn update(apps: Vec<App>) {
  for _ in apps {}
}
