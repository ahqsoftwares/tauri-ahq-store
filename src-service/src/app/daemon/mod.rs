use std::sync::mpsc::{channel, Receiver, RecvError, SendError, Sender, TryRecvError};

use reqwest::blocking::Client;

pub mod app_manager;

mod runner;

struct Controller {
    tx: Sender<String>,
    rx: Receiver<String>,
}
enum RevcErrors {
    Blocking(Result<String, RecvError>),
    NonBlocking(Result<String, TryRecvError>),
}

static mut CHANNELS: Option<Controller> = None;

pub fn start(client: Client) {
    let (tx, rx) = channel::<String>();
    let (tx_2, rx_2) = channel::<String>();

    unsafe {
        CHANNELS = Some(Controller { tx, rx: rx_2 });
    }

    runner::run(tx_2, rx, client);
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
            _ => {
                receive_stop_signal(depth + 1)
            }
        }
    }
}