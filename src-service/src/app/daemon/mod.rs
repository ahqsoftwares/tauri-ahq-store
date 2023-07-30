use std::{
    sync::mpsc::{channel, Receiver, RecvError, SendError, Sender, TryRecvError},
    thread::{self, spawn},
    time::Duration,
};

use reqwest::blocking::Client;
use serde_json::to_string;
use ws::Sender as WsSender;

mod get_commit;
mod runner;
mod structs;

pub mod app_manager;
pub mod preferences;
pub use get_commit::get_commit;
pub use structs::*;

use crate::auth::encrypt;

const ID: &str = "ā";

struct Controller {
    tx: Sender<String>,
    rx: Receiver<String>,
}
enum RevcErrors {
    Blocking(Result<String, RecvError>),
    NonBlocking(Result<String, TryRecvError>),
}

static mut UNIVERSALSENDER: Option<WsSender> = None;
static mut REQUESTS: Vec<(String, WsSender)> = vec![];
static mut CHANNELS: Option<Controller> = None;

pub fn start(client: Client) {
    let (tx, rx) = channel::<String>();
    let (tx_2, rx_2) = channel::<String>();

    unsafe {
        CHANNELS = Some(Controller { tx, rx: rx_2 });
    }

    runner::run(tx_2, rx, client);
    unsafe {
        spawn(|| {
            start_receiving();
        });
    }
}

pub unsafe fn set_sender(sender: WsSender) {
    UNIVERSALSENDER = Some(sender);
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct WsResponse {
    method: String,
    payload: String,
    ref_id: String,
    auth: String,
}

unsafe fn start_receiving() {
    loop {
        match receive(false) {
            RevcErrors::NonBlocking(Ok(msg)) => {
                let data: Vec<String> = msg.split(ID).map(|x| x.clone().to_string()).collect();

                let method = data[0].clone();
                let ref_id = data[1].clone();
                let payload = data[2].clone();

                let requests = REQUESTS.clone();
                let iterated = requests.iter();

                let data = WsResponse {
                    method: method.clone(),
                    payload: payload.clone(),
                    ref_id: ref_id.clone(),
                    auth: include!(concat!(env!("CARGO_MANIFEST_DIR"), "/src/auth/encrypt"))
                        .to_string(),
                };

                if &ref_id == &String::from("CASUALUPDATE") {
                    if let Some(sender) = &UNIVERSALSENDER {
                        let data = to_string(&data).unwrap_or(String::from("\"Error\""));

                        sender
                            .broadcast(encrypt(data).unwrap_or("".into()))
                            .unwrap_or(());
                    }
                } else {
                    REQUESTS = iterated
                        .filter(|(string, sender)| {
                            if string == &ref_id {
                                let data_clone = data.method.clone();
                                let data = to_string(&data).unwrap_or(String::from("\"Error\""));

                                #[cfg(debug_assertions)]
                                sender.send(data.clone()).unwrap_or(());

                                if let Some(x) = encrypt(data) {
                                    sender.send(x).unwrap_or(());
                                }

                                return &data_clone != "TERMINATE";
                            }
                            true
                        })
                        .map(|(s, k)| (s.clone(), k.clone()))
                        .collect();
                }

                #[cfg(debug_assertions)]
                if let Some(sender) = &UNIVERSALSENDER {
                    sender
                        .broadcast(
                            to_string(&WsResponse {
                                auth: "%TEST%".into(),
                                method: "STATS".into(),
                                payload: REQUESTS.len().to_string(),
                                ref_id: "%DEBUG%".into(),
                            })
                            .unwrap(),
                        )
                        .unwrap_or(());
                }
            }
            _ => {}
        }

        thread::sleep(Duration::from_millis(500));
    }
}

unsafe fn send(msg: String) -> Result<(), SendError<String>> {
    let tx = &CHANNELS.as_ref().unwrap().tx;

    return tx.send(msg);
}

unsafe fn receive(block: bool) -> RevcErrors {
    let rx = &CHANNELS.as_ref().unwrap().rx;

    if block {
        RevcErrors::Blocking(rx.recv())
    } else {
        RevcErrors::NonBlocking(rx.try_recv())
    }
}

pub fn stop() {
    unsafe {
        send("STOP".to_owned()).unwrap();
        receive_stop_signal(0);
    }
}

pub fn list_apps(ref_id: String, sender: WsSender) -> bool {
    unsafe {
        match send(format!("{}{}LISTAPPS{}NONE", ref_id.clone(), ID, ID)) {
            Err(_) => {
                return false;
            }
            _ => {
                REQUESTS.push((ref_id.clone(), sender));
                return true;
            }
        }
    }
}

pub fn preferences(ref_id: String, sender: WsSender) -> bool {
    unsafe {
        match send(format!("{}{}GET_PREFS{}NONE", ref_id.clone(), ID, ID)) {
            Err(_) => {
                return false;
            }
            _ => {
                REQUESTS.push((ref_id.clone(), sender));
                return true;
            }
        }
    }
}

pub fn post_preferences(ref_id: String, prefs: String, sender: WsSender) -> bool {
    unsafe {
        match send(format!("{}{}POST_PREFS{}{}", ref_id.clone(), ID, ID, prefs)) {
            Err(_) => {
                return false;
            }
            _ => {
                REQUESTS.push((ref_id.clone(), sender));
                return true;
            }
        }
    }
}

pub fn get_apps(ref_id: String, app_ids: Vec<String>, sender: WsSender) -> bool {
    unsafe {
        match send(format!(
            "{}{}APP{}{}",
            ref_id.clone(),
            ID,
            ID,
            to_string(&app_ids).unwrap_or("".to_owned())
        )) {
            Err(_) => {
                return false;
            }
            _ => {
                REQUESTS.push((ref_id.clone(), sender));
                return true;
            }
        }
    }
}

pub fn install_apps(ref_id: String, app_ids: Vec<String>, sender: WsSender) -> bool {
    unsafe {
        match send(format!(
            "{}{}INSTALL{}{}",
            ref_id.clone(),
            ID,
            ID,
            to_string(&app_ids).unwrap_or("".to_owned())
        )) {
            Err(_) => {
                return false;
            }
            _ => {
                REQUESTS.push((ref_id.clone(), sender));
                return true;
            }
        }
    }
}

pub fn uninstall_apps(ref_id: String, app_ids: Vec<String>, sender: WsSender) -> bool {
    unsafe {
        match send(format!(
            "{}{}UNINSTALL{}{}",
            ref_id.clone(),
            ID,
            ID,
            to_string(&app_ids).unwrap_or("".to_owned())
        )) {
            Err(_) => {
                return false;
            }
            _ => {
                REQUESTS.push((ref_id.clone(), sender));
                return true;
            }
        }
    }
}

pub fn get_commit_id(ref_id: String, sender: WsSender) -> bool {
    unsafe {
        match send(format!("{}{}COMMIT{}ee", ref_id.clone(), ID, ID)) {
            Err(_) => {
                return false;
            }
            _ => {
                REQUESTS.push((ref_id.clone(), sender));
                return true;
            }
        }
    }
}

pub fn get_update_stats(ref_id: String, sender: WsSender) -> bool {
    unsafe {
        match send(format!("{}{}UPDATE{}ee", ref_id.clone(), ID, ID)) {
            Err(_) => {
                return false;
            }
            _ => {
                REQUESTS.push((ref_id.clone(), sender));
                return true;
            }
        }
    }
}

pub fn run_update(ref_id: String, sender: WsSender) -> bool {
    unsafe {
        match send(format!("{}{}CHECKUPDATE{}ee", ref_id.clone(), ID, ID)) {
            Err(_) => {
                return false;
            }
            _ => {
                REQUESTS.push((ref_id.clone(), sender));
                return true;
            }
        }
    }
}

fn receive_stop_signal(depth: u8) {
    if depth >= 10 {
        return;
    }

    unsafe {
        match receive(true) {
            RevcErrors::Blocking(Ok(msg)) => {
                if msg != String::from("Ok") {
                    receive_stop_signal(depth + 1);
                }
            }
            _ => receive_stop_signal(depth + 1),
        }
    }
}
