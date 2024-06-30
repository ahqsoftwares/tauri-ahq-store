use std::{io::Write, mem::replace, os::windows::io::AsHandle};

use ahqstore_types::{AppStatus, Library};

use crate::handlers::install_app;

use super::{DaemonData, DaemonState, Step};

pub async fn handle(resp: &mut Library, state: &mut DaemonState) {
  let data = state.data.as_mut().unwrap();

  if let DaemonData::Dwn(x) = data {
    match x.ext_bytes.chunk().await {
      Ok(Some(chunk)) => {
        let len = chunk.len() as f64;

        let prog = len / resp.max as f64;
        resp.progress += prog;

        let _ = x.file.write_all(&chunk);
      }
      Ok(None) => {
        let _ = x.file.flush();

        state.step = Step::Installing;
        state.data = Some(DaemonData::Inst(install_app(x.app.clone()).await.unwrap()));
      }
      _ => {}
    }
  }
}

pub async fn handle_inst(resp: &mut Library, state: &mut DaemonState) {
  let data = state.data.as_mut().unwrap();

  let handle_exit = |success: bool, resp: &mut Library, state: &mut DaemonState| {
    if !success {
      resp.status = AppStatus::NotSuccessful;
    } else {
      resp.status = AppStatus::InstallSuccessful;
    }
    state.step = Step::Done;
  };

  if let DaemonData::Inst(x) = data {
    match x.try_wait() {
      Ok(Some(s)) => handle_exit(s.success(), resp, state),
      // Let's actually block
      Ok(None) => match x.wait() {
        Ok(s) => handle_exit(s.success(), resp, state),
        _ => handle_exit(false, resp, state),
      },
      _ => handle_exit(false, resp, state),
    }
  }
}

pub async fn handle_u_inst(resp: &mut Library, state: &mut DaemonState) {
  let data = state.data.as_mut().unwrap();

  let handle_exit = |success: bool, resp: &mut Library, state: &mut DaemonState| {
    if !success {
      resp.status = AppStatus::NotSuccessful;
    } else {
      resp.status = AppStatus::UninstallSuccessful;
    }
    state.step = Step::Done;
  };

  if let DaemonData::Unst(x) = data {
    if x.is_finished() {
      let x = replace(x, std::thread::spawn(|| None));
      match x.join() {
        Ok(Some(x)) => handle_exit(true, resp, state),
        Ok(None) => handle_exit(false, resp, state),
        Err(_) => handle_exit(false, resp, state),
      }
    }
  }
}
