use std::io::Write;

use ahqstore_types::Library;

use crate::handlers::install_app;

use super::{DaemonData, DaemonState, Step};

pub async fn handle(resp: &mut Library, state: &mut DaemonState) {
  let data = state.data.as_mut().unwrap();

  if let DaemonData::Dwn(x) = data {
    match x.ext_bytes.chunk().await {
      Ok(Some(chunk)) => {
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

  if let DaemonData::Inst(x) = data {
    match x.try_wait() {
      Ok(Some(s)) => {
        if s.success() {
        } else {
        }
      }
      Ok(None) => {}
      _ => {
        state.step = Step::Done;
      }
    }
  }
}
