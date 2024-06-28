mod dwn;
mod recv;

use recv::recv;

use ahqstore_types::{
  AHQStoreApplication, AppStatus, Command, Library, Response, ToDo, UpdateStatusReport,
};
use reqwest::Request;
use std::{
  default,
  fs::File,
  future::{Future, IntoFuture},
  process::Child,
  sync::mpsc::{channel, Receiver, Sender},
  time::{Duration, SystemTime},
};
use tokio::{
  spawn,
  time::{sleep, Sleep},
};

use crate::utils::{get_iprocess, ws_send};

use super::{
  get_app, get_commit, get_prefs, list_apps,
  service::{download_app, install_app},
  uninstall_app,
};

pub static mut UPDATE_STATUS_REPORT: Option<UpdateStatusReport> = None;
pub static mut LIBRARY: Option<Vec<Library>> = None;

fn time() -> u64 {
  SystemTime::now()
    .duration_since(SystemTime::UNIX_EPOCH)
    .unwrap()
    .as_secs()
}

pub fn lib_msg() -> Vec<u8> {
  Response::as_msg(Response::Library(0, unsafe {
    LIBRARY
      .as_ref()
      .unwrap()
      .clone()
      .into_iter()
      .map(|mut x| {
        x.app = None;
        x
      })
      .collect()
  }))
}

pub static BETWEEN: fn() -> Sleep = || sleep(Duration::from_millis(100));

pub fn get_install_daemon() -> Sender<Command> {
  let (tx, rx) = channel();

  spawn(async move {
    run_daemon(rx).await;
  });

  tx
}

#[derive(Default, Debug)]
pub enum Step {
  StartDownload,
  Downloading,
  Installing,
  StartUninstall,
  Uninstalling,
  #[default]
  Done,
}

#[derive(Debug)]
pub enum DaemonData {
  Dwn(DownloadData),
  Inst(Child),
  Unst(Child),
  None,
}

#[derive(Debug)]
pub struct DownloadData {
  pub current: u64,
  pub total: u64,
  pub last: f64,
  pub file: File,
  pub ext_bytes: reqwest::Response,
  pub app: AHQStoreApplication,
}

#[derive(Debug, Default)]
pub struct DaemonState {
  pub step: Step,
  pub data: Option<DaemonData>,
  pub entry: usize,
}

async fn run_daemon(mut rx: Receiver<Command>) {
  let mut state = DaemonState::default();

  unsafe {
    UPDATE_STATUS_REPORT = Some(UpdateStatusReport::Disabled);
    LIBRARY = Some(vec![]);
  }
  let should_autorun = get_prefs().auto_update_apps;

  if should_autorun {
    unsafe {
      UPDATE_STATUS_REPORT = Some(UpdateStatusReport::UpToDate);
    }
  }

  let mut secs = time() - 800;
  let mut last_has_updated = false;
  let run_update = || check_update();

  let pending = unsafe { LIBRARY.as_mut().unwrap() };

  let mut run_update_now = false;
  loop {
    // Get data loop
    let Some(mut ws) = get_iprocess() else {
      BETWEEN().await;
      continue;
    };

    if recv::recv(&mut rx, pending, &mut run_update_now).await {
      ws_send(&mut ws, &lib_msg()).await;
    }

    if (should_autorun && time() > secs) || run_update_now {
      run_update_now = false;
      secs = time() + 600;

      if 0 == get_commit().await {
        run_update().await;
      }
    }

    if let Step::Done = state.step {
      if pending.len() > 0 {
        pending.remove(0);
      }

      if pending.len() > 0 {
        let data = pending.get(0).unwrap();

        state = DaemonState {
          step: match data.to {
            ToDo::Install => Step::StartDownload,
            ToDo::Uninstall => Step::StartUninstall,
          },
          data: None,
          entry: 0,
        }
      }
    } else if let Step::StartDownload = state.step {
      let entry = pending.get_mut(state.entry).unwrap();
      if let Some((app, file, resp)) = download_app(entry).await {
        let len = resp.content_length().unwrap_or(0);

        entry.max = len;
        entry.status = AppStatus::Downloading;

        state.step = Step::Downloading;
        state.data = Some(DaemonData::Dwn(DownloadData {
          app,
          file,
          ext_bytes: resp,
          total: len,
          current: 0,
          last: 0.0,
        }));
      } else {
        state.step = Step::Done;
        entry.status = AppStatus::NotSuccessful;
      }
    } else if let Step::Downloading = state.step {
      let resp = pending.get_mut(state.entry).unwrap();
      dwn::handle(resp, &mut state).await;
    }

    ws_send(&mut ws, &lib_msg()).await;

    let mut has_updated = false;
    // for cmd in pending.iter_mut() {
    //   let to = cmd.to.clone();
    //   match &to {
    //     ToDo::Install => {
    //       cmd.status = AppStatus::Downloading;
    //       ws_send(&mut ws, &lib_msg()).await;
    //       BETWEEN().await;

    //       if let Some(x) = download_app(cmd).await {
    //         cmd.status = AppStatus::Installing;

    //         ws_send(&mut ws, &lib_msg()).await;
    //         BETWEEN().await;
    //         BETWEEN().await;
    //         BETWEEN().await;

    //         if let Some(_) = install_app(x.0).await {
    //           cmd.status = AppStatus::InstallSuccessful;

    //           if cmd.is_update {
    //             was_updates = true;
    //           }
    //         } else {
    //           cmd.status = AppStatus::NotSuccessful;
    //         }
    //       } else {
    //         cmd.status = AppStatus::NotSuccessful;
    //       }
    //       ws_send(&mut ws, &lib_msg()).await;
    //       BETWEEN().await;
    //     }
    //     ToDo::Uninstall => {
    //       cmd.status = AppStatus::Uninstalling;
    //       ws_send(&mut ws, &lib_msg()).await;
    //       BETWEEN().await;

    //       if let Some(app) = &cmd.app {
    //         if let None = uninstall_app(app) {
    //           cmd.status = AppStatus::NotSuccessful;
    //         } else {
    //           cmd.status = AppStatus::UninstallSuccessful;
    //         }
    //       }
    //       ws_send(&mut ws, &lib_msg()).await;
    //       BETWEEN().await;
    //     }
    //   }

    //   BETWEEN().await;
    // }
    unsafe {
      match UPDATE_STATUS_REPORT.as_ref().unwrap() {
        UpdateStatusReport::UpToDate => {}
        _ => {
          if has_updated != last_has_updated {
            last_has_updated = has_updated;
            UPDATE_STATUS_REPORT = Some(UpdateStatusReport::UpToDate);
            let _ = ws_send(
              &mut ws,
              &Response::as_msg(Response::UpdateStatus(0, UpdateStatusReport::UpToDate)),
            )
            .await;
          }
        }
      }
    }

    BETWEEN().await;
  }
}

pub async fn check_update() -> Option<bool> {
  let mut to_update = vec![];

  let Some(mut ws) = get_iprocess() else {
    return None;
  };

  unsafe {
    UPDATE_STATUS_REPORT = Some(UpdateStatusReport::Checking);
    let _ = ws_send(
      &mut ws,
      &Response::as_msg(Response::UpdateStatus(0, UpdateStatusReport::Checking)),
    )
    .await;
  }

  if let Some(x) = list_apps() {
    for (id, ver) in x {
      if &ver == "custom" {
        continue;
      }

      let app = get_app(0, id).await;
      match app {
        Response::AppData(_, id, app) => {
          if &ver == &app.version {
            continue;
          }
          to_update.push((id, app));
        }
        _ => {}
      }
    }
  }

  let library = unsafe { LIBRARY.as_mut().unwrap() };

  if to_update.is_empty() {
    unsafe {
      UPDATE_STATUS_REPORT = Some(UpdateStatusReport::UpToDate);
    }
    let _ = ws_send(
      &mut ws,
      &Response::as_msg(Response::UpdateStatus(0, UpdateStatusReport::UpToDate)),
    )
    .await;

    return Some(false);
  }

  to_update.into_iter().for_each(|(id, app)| {
    library.push(Library {
      app_id: id.clone(),
      is_update: true,
      progress: 0.0,
      status: AppStatus::Pending,
      to: ToDo::Uninstall,
      max: 0,
      app: Some(app.clone()),
    });
    library.push(Library {
      app_id: id,
      is_update: true,
      progress: 0.0,
      status: AppStatus::Pending,
      to: ToDo::Install,
      app: Some(app),
      max: 0,
    });
  });

  unsafe {
    UPDATE_STATUS_REPORT = Some(UpdateStatusReport::Updating);
    let _ = ws_send(
      &mut ws,
      &Response::as_msg(Response::UpdateStatus(0, UpdateStatusReport::Updating)),
    )
    .await;
    return Some(false);
  }
}
