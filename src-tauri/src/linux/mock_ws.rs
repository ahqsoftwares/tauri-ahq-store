use std::{thread::{spawn, sleep}, time::Duration, sync::{mpsc::{Sender, channel}, Arc}};
use ahqstore_types::*;
use serde_json::{from_str, to_string};
use tauri::{Window, Manager};

pub fn init(window: Arc<Window>) {
    let tx = daemon(window.clone());
    window.listen("ws_send", move |event| {
        if let Some(data) = event.payload() {
            if let Ok(data) = from_str(data) {
                let _ = tx.send(data);
            }
        }
    });
}

fn daemon(window: Arc<Window>) -> Sender<Command> {
    let (tx, t_rx) = channel::<Command>();

    spawn(move || loop {
        let send_window = |resp: Response| {
            if let Ok(resp) = to_string(&resp) {
                let _ = window.emit_all("ws_resp", resp);
            }
        };
        let term = |ref_id: u64| {
            send_window(Response::TerminateBlock(ref_id));
        };

        if let Ok(resp) = t_rx.try_recv() {
            println!("{:?}", &resp);
            match resp {
                Command::GetPrefs(ref_id) => {
                    send_window(Response::Prefs(ref_id, Prefs::default()));
                    term(ref_id);
                }
                Command::SetPrefs(ref_id, _) => {
                    send_window(Response::PrefsSet(ref_id));
                    term(ref_id);
                }
                _ => {}
            }
        }
        sleep(Duration::from_millis(3));
    });

    tx
}