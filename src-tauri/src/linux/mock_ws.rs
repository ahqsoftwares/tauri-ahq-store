use ahqstore_types::*;
use lazy_static::lazy_static;
use reqwest::{Client, ClientBuilder};
use serde_json::{from_str, to_string};
use std::{
  sync::mpsc::{channel, Sender},
  thread::{sleep, spawn},
  time::Duration,
};
use tauri::{Manager, WebviewWindow};

pub static mut GH_URL: Option<String> = None;

lazy_static! {
    static ref CLIENT: Client = ClientBuilder::new()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36")
        .timeout(Duration::from_secs(60))
        .build()
        .unwrap();
}

pub fn init(window: WebviewWindow) {
  std::thread::spawn(|| gh_url());
  let tx = daemon(window.clone());
  window.listen("ws_send", move |event| {
    let data = event.payload();
      if let Ok(data) = from_str::<String>(&data) {
        if let Ok(data) = from_str::<Command>(&data) {
          let _ = tx.send(data);
        }
      }
    
  });
}

fn gh_url() {
  tokio::runtime::Builder::new_current_thread()
    .worker_threads(1)
    .enable_all()
    .build()
    .unwrap()
    .block_on(async {
      loop {
        if let Ok(resp) = CLIENT
          .get("https://api.github.com/repos/ahqstore/apps/commits")
          .send()
          .await
        {
          if let Ok(mut data) = resp.json::<Vec<Commit>>().await {
            let data = data.remove(0);

            unsafe { GH_URL = Some(data.sha) }
          }
        }
        tokio::time::sleep(Duration::from_secs(1800)).await;
      }
    });
}

fn daemon(window: WebviewWindow) -> Sender<Command> {
  let (tx, t_rx) = channel::<Command>();

  spawn(move || loop {
    let send_window = |resp: Response| {
      let _ = window.app_handle().emit("ws_resp", &vec![to_string(&resp).unwrap()]);
    };
    let term = |ref_id: u64| {
      send_window(Response::TerminateBlock(ref_id));
    };

    if let Ok(resp) = t_rx.try_recv() {
      match resp {
        Command::GetSha(ref_id) => {
          unsafe {
            send_window(Response::SHAId(ref_id, GH_URL.as_ref().unwrap().into()));
          }

          term(ref_id);
        }
        Command::GetPrefs(ref_id) => {
          send_window(Response::Prefs(ref_id, Prefs::default()));
          term(ref_id);
        }
        Command::SetPrefs(ref_id, _) => {
          send_window(Response::PrefsSet(ref_id));
          term(ref_id);
        }
        Command::ListApps(ref_id) => {
          send_window(Response::ListApps(ref_id, vec![]));
          term(ref_id);
        }
        _ => {}
      }
    }
    sleep(Duration::from_millis(3));
  });

  tx
}
