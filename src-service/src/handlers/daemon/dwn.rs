use std::{io::Write, mem::replace};

use ahqstore_types::{AppStatus, Library};

use crate::{
  handlers::{av, install_app},
  utils::get_installer_file,
};

use super::{DaemonData, DaemonState, Step};

pub async fn handle(resp: &mut Library, state: &mut DaemonState, imp: &mut bool) {
  let data = state.data.as_mut().unwrap();

  if let DaemonData::Dwn(x) = data {
    match x.ext_bytes.chunk().await {
      Ok(Some(chunk)) => {
        let len = chunk.len() as f64;

        let prog = len * 100.0 / resp.max as f64;
        resp.progress += prog;

        let _ = x.file.write_all(&chunk);
      }
      Ok(None) => {
        println!("100 %");
        let _ = x.file.flush();
        let _ = x.file.sync_all();
        //let app = x.app.clone();

        //Drop the File
        let mut data = replace(&mut state.data, None);
        let mut data = data.expect("Impossible to be null");
        let DaemonData::Dwn(x) = data else {
          panic!("Impossible panic");
        };

        resp.status = AppStatus::AVScanning;

        let inst = get_installer_file(&x.app);
        state.data = Some(DaemonData::AVScan((x.app, av::scan::scan_threaded(&inst))));
        state.step = Step::AVScanning;
        *imp = true;
      }
      _ => {}
    }
  }
}

pub async fn av_scan(resp: &mut Library, state: &mut DaemonState, imp: &mut bool) {
  let data = state.data.as_mut().unwrap();

  if let DaemonData::AVScan((app, x)) = data {
    if x.is_finished() {
      *imp = true;
      let mut data = replace(&mut state.data, None);
      let data = data.expect("Impossible to be null");

      let DaemonData::AVScan((app, x)) = data else {
        panic!("Impossible panic");
      };

      let av_flagged = x.join().expect("This cannot panic as the Thread cannot");

      if !av_flagged.unwrap_or(false) {
        resp.status = AppStatus::Installing;

        state.step = Step::Installing;
        state.data = Some(DaemonData::Inst(install_app(&app).await.unwrap()));
      } else {
        state.step = Step::Done;

        resp.status = AppStatus::AVFlagged;
      }
    }
  }
}

pub async fn handle_inst(resp: &mut Library, state: &mut DaemonState, imp: &mut bool) {
  let data = state.data.as_mut().unwrap();

  let handle_exit = |imp: &mut bool, success: bool, resp: &mut Library, state: &mut DaemonState| {
    *imp = true;
    if !success {
      resp.status = AppStatus::NotSuccessful;
    } else {
      resp.status = AppStatus::InstallSuccessful;
    }
    state.step = Step::Done;
  };

  if let DaemonData::Inst(x) = data {
    match x.try_wait() {
      Ok(Some(s)) => handle_exit(imp, s.success(), resp, state),
      // Let's actually block
      Ok(None) => match x.wait() {
        Ok(s) => handle_exit(imp, s.success(), resp, state),
        _ => handle_exit(imp, false, resp, state),
      },
      _ => handle_exit(imp, false, resp, state),
    }
  }
}

pub async fn handle_u_inst(resp: &mut Library, state: &mut DaemonState, imp: &mut bool) {
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
      *imp = true;

      let x = replace(x, std::thread::spawn(|| false));
      let x = x.join();

      handle_exit(
        match x {
          Ok(s) => s,
          _ => false,
        },
        resp,
        state,
      )
    }
  }
}
