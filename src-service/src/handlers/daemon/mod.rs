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
  thread::JoinHandle,
  time::{Duration, SystemTime},
};
use tokio::{
  spawn,
  time::{sleep, Sleep},
};

use crate::utils::{get_iprocess, ws_send};

use super::{
  av::{self, scan::Malicious},
  get_app, get_commit, get_prefs, list_apps,
  service::{download_app, install_app, UninstallResult},
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

fn time_millis() -> u128 {
  SystemTime::now()
    .duration_since(SystemTime::UNIX_EPOCH)
    .unwrap()
    .as_millis()
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

pub static BETWEEN: fn() -> Sleep = || sleep(Duration::from_millis(20));

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
  AVScanning,
  Installing,
  StartUninstall,
  Uninstalling,
  Done,
  #[default]
  None,
}

#[derive(Debug)]
pub enum DaemonData {
  Dwn(DownloadData),
  AVScan((AHQStoreApplication, JoinHandle<Option<Malicious>>)),
  Inst(Child),
  Unst(JoinHandle<bool>),
  None,
}

#[derive(Debug)]
pub struct DownloadData {
  pub current: u64,
  pub total: u64,
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
  let _ = av::update::update_win_defender();
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

  let mut lib_sent = time_millis();
  loop {
    // Get data loop
    let Some(mut ws) = get_iprocess() else {
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

    let mut state_change = false;
    if let Step::None = state.step {
      if pending.len() > 0 {
        let data = pending.get(0).unwrap();

        state = DaemonState {
          step: match data.to {
            ToDo::Install => Step::StartDownload,
            ToDo::Uninstall => Step::StartUninstall,
          },
          data: None,
          entry: 0,
        };
        state_change = true;
      }
    } else if let Step::Done = state.step {
      if pending.len() > 0 {
        pending.remove(0);
      }

      state.step = Step::None;
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
        }));
      } else {
        state.step = Step::Done;
        entry.status = AppStatus::NotSuccessful;
      }
      state_change = true;
    } else if let Step::Downloading = state.step {
      let resp = pending.get_mut(state.entry).unwrap();
      dwn::handle(resp, &mut state, &mut state_change).await;
    } else if let Step::AVScanning = state.step {
      let resp = pending.get_mut(state.entry).unwrap();
      dwn::av_scan(resp, &mut state, &mut state_change).await;
    } else if let Step::StartUninstall = state.step {
      let resp = pending.get_mut(state.entry).unwrap();

      if let Some(x) = &resp.app {
        let res = uninstall_app(&x);

        match res {
          // No implementors
          UninstallResult::Sync(x) => {
            state.step = Step::Done;
            match x {
              Some(_) => resp.status = AppStatus::UninstallSuccessful,
              _ => resp.status = AppStatus::NotSuccessful,
            }
          }

          // Only Implemented
          UninstallResult::Thread(x) => {
            resp.status = AppStatus::Uninstalling;
            state.step = Step::Uninstalling;
            state.data = Some(DaemonData::Unst(x));
          }
        }

        state_change = true;
      }
    } else if let Step::Installing = state.step {
      let resp = pending.get_mut(state.entry).unwrap();
      dwn::handle_inst(resp, &mut state, &mut state_change).await;
    } else if let Step::Uninstalling = state.step {
      let resp = pending.get_mut(state.entry).unwrap();
      dwn::handle_u_inst(resp, &mut state, &mut state_change).await;
    }

    if time_millis() - lib_sent >= 1500 || state_change {
      ws_send(&mut ws, &lib_msg()).await;
      lib_sent = time_millis();
    }

    let mut has_updated = false;

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

    match state.step {
      Step::Downloading => {}
      _ => BETWEEN().await,
    };
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
