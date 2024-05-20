use std::{
  sync::mpsc::{channel, Sender},
  time::{Duration, SystemTime},
};

use ahqstore_types::{AppStatus, Command, Library, Response, ToDo, UpdateStatusReport};
use tokio::{spawn, time::sleep};

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
    LIBRARY.as_ref().unwrap().clone()
      .into_iter()
      .map(|mut x| {
        x.app = None; 
        x
      })
      .collect()
  }))
}

pub fn get_install_daemon() -> Sender<Command> {
  let (tx, rx) = channel();

  println!("Daemon Running");
  spawn(async move {
    unsafe {
      UPDATE_STATUS_REPORT = Some(UpdateStatusReport::Disabled);
      LIBRARY = Some(vec![]);
      println!("LIB Setted");
    }
    let should_autorun = get_prefs().auto_update_apps;

    if should_autorun {
      unsafe { UPDATE_STATUS_REPORT = Some(UpdateStatusReport::UpToDate); }
    }

    let mut secs = time() + 600;

    let between = || sleep(Duration::from_millis(100));
    let run_update = || check_update();

    let pending = unsafe { LIBRARY.as_mut().unwrap() };
    
    let mut run_update_now = false;
    loop {
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
                app: None,
              });
            },
            Command::UninstallApp(ref_id, app_id) => {
              if let Response::AppData(_, app_id, app) = get_app(ref_id, app_id).await {
                pending.push(Library {
                  app_id,
                  is_update: false,
                  app: Some(
                    app
                  ),
                  progress: 0.0,
                  status: AppStatus::Pending,
                  to: ToDo::Uninstall,
                });
              }
            }
            Command::RunUpdate(_) => {
              run_update_now = true;
            }
            _ => {
            }
          }
        } else {
          break 'r;
        }
        between().await;
      }

      if time() > secs || run_update_now {
        run_update_now = false;
        if 0 == get_commit().await {
          secs = time() + 600;

          if should_autorun {
            run_update().await;
          }
        }
      }

      if let Some(mut ws) = get_iprocess() {
        let mut was_updates = false;
        for cmd in pending.iter_mut() {
          let to = cmd.to.clone();
          println!("{:?} {:?} {:?}", &cmd.status, &cmd.to, &cmd.app_id);
          match &to {
            ToDo::Install => {
              cmd.status = AppStatus::Downloading;
              ws_send(&mut ws, &lib_msg()).await;
              between().await;

              if let Some(x) = download_app(cmd).await {
                cmd.status = AppStatus::Installing;

                println!("Sending Installing Status");
                ws_send(&mut ws, &lib_msg()).await;
                between().await;
                between().await;
                between().await;

                if let Some(_) = install_app(x).await {
                  cmd.status = AppStatus::InstallSuccessful;

                  if cmd.is_update {
                    was_updates = true;
                  }
                } else {
                  cmd.status = AppStatus::NotSuccessful;
                }
              } else {
                cmd.status = AppStatus::NotSuccessful;
              }
              ws_send(&mut ws, &lib_msg()).await;
              between().await;
            }
            ToDo::Uninstall => {
              cmd.status = AppStatus::Uninstalling;
              ws_send(&mut ws, &lib_msg()).await;
              between().await;

              if let Some(app) = &cmd.app {
                if let None = uninstall_app(app) {
                  cmd.status = AppStatus::NotSuccessful;
                } else {
                  cmd.status = AppStatus::UninstallSuccessful;
                }
              }
              ws_send(&mut ws, &lib_msg()).await;
              between().await;
            }
            /*Command::GetApp(ref_id, app_id) => {
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
                    _ => {}*/
          }

          between().await;
        }
        *pending = vec![];
        unsafe {
          if was_updates {
            UPDATE_STATUS_REPORT = Some(UpdateStatusReport::UpToDate);
          }
        }
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

  let library = unsafe { LIBRARY.as_mut().unwrap() };
  for (id, app) in to_update {
    library.push(Library {
      app_id: id,
      is_update: true,
      progress: 0.0,
      status: AppStatus::Pending,
      to: ToDo::Uninstall,
      app: Some(app)
    });
    unsafe {
      UPDATE_STATUS_REPORT = Some(UpdateStatusReport::Updating);
    }
  }
}
