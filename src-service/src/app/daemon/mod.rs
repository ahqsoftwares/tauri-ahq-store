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

pub mod app_manager;
pub use get_commit::get_commit;

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
                };

                if &ref_id == &String::from("CASUALUPDATE") {
                    if let Some(sender) = &UNIVERSALSENDER {
                        let data = to_string(&data).unwrap_or(String::from("\"Error\""));

                        sender.broadcast(data).unwrap_or(());
                    }
                } else {
                    iterated.clone().for_each(|(string, sender)| {
                        if string == &ref_id {
                            let data = to_string(&data).unwrap_or(String::from("\"Error\""));

                            sender.send(data).unwrap_or(());
                        }
                    });
                }

                REQUESTS = iterated
                    .filter(|(string, _)| {
                        string != &ref_id
                            || (&method == &"UPDATE".to_string() && !payload.ends_with(":[]"))
                    })
                    .map(|(s, k)| (s.clone(), k.clone()))
                    .collect();
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
