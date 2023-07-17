use bcrypt::verify;
use crypter::decrypt;
use serde::ser::Serialize;
use serde_json::{from_str, to_string, to_string_pretty};
use std::{
    fs::read_to_string,
    net::TcpStream,
    sync::{Arc, Mutex},
    thread::spawn,
};
use tungstenite::{connect, stream::MaybeTlsStream, WebSocket};

use crate::{
    get_system_dir,
    util::structs::{PayloadReq, Req, ServerResp, ToSendResp},
};

static mut WS: Option<WebSocket<MaybeTlsStream<TcpStream>>> = None;

static mut TERMINATED: bool = false;
static mut CONNECTION: Option<WsConnection> = None;
static mut WINDOW: Option<tauri::Window> = None;

#[allow(unused)]
struct WsConnection<'a> {
    pub binding_server: String,
    pub error: &'a dyn Fn() -> (),
    to_send: Arc<Mutex<Vec<String>>>,
    pending: Arc<Mutex<Vec<String>>>,
}

unsafe impl Send for WsConnection<'_> {}
unsafe impl Sync for WsConnection<'_> {}

impl<'a> WsConnection<'a> {
    pub fn new(server: String, error: &'a dyn Fn() -> ()) -> Self {
        Self {
            binding_server: server,
            error,
            to_send: Arc::new(Mutex::new(vec![])),
            pending: Arc::new(Mutex::new(vec![])),
        }
    }

    pub fn send_ws<T: Serialize>(&mut self, value: T) {
        if let Ok(ref mut x) = self.to_send.try_lock() {
            x.push(to_string_pretty(&value).unwrap());
        }
    }

    pub fn recv(&mut self) -> Option<Vec<String>> {
        if let Ok(mut pending) = self.pending.try_lock() {
            Some(
                pending
                    .drain(..)
                    .into_iter()
                    .filter(|x| {
                        if let Ok(payload) = from_str::<ServerResp>(&x) {
                            if let Ok(x) = verify(&include!("./encrypt"), &payload.auth) {
                                return x;
                            }
                        }
                        println!("Something went to false");
                        println!("{}", &x);
                        false
                    })
                    .map(|x| {
                        if let Ok(payload) = from_str::<ServerResp>(&x) {
                            return to_string(&ToSendResp {
                                method: payload.method,
                                payload: payload.payload,
                                reason: payload.reason,
                                ref_id: payload.ref_id.replace(include!("./encrypt"), "****"),
                                status: payload.status,
                            })
                            .unwrap();
                        }

                        panic!("")
                    })
                    .collect(),
            )
        } else {
            None
        }
    }

    fn load_into(&mut self, msg: String) {
        let pending = self.pending.clone();

        if let Ok(mut x) = pending.try_lock() {
            x.push(msg);
        } else {
            std::thread::sleep(std::time::Duration::from_millis(1000));
            self.load_into(msg);
        };
    }

    pub unsafe fn start(&mut self) {
        let (tx, rx) = std::sync::mpsc::channel::<String>();
        let server = self.binding_server.clone().to_string();
        let websocket = connect(server).unwrap();

        WS = Some(websocket.0);

        spawn(move || {
            if let Some(ws) = WS.as_mut() {
                loop {
                    if let Ok(msg) = ws.read_message() {
                        if let Ok(txt) = msg.to_text() {
                            tx.send(txt.into()).unwrap_or(());
                        }
                    }
                    std::thread::sleep(std::time::Duration::from_millis(20));
                }
            }
        });

        //Handle Read + Write at high speed
        loop {
            if let Ok(ref mut x) = self.to_send.try_lock() {
                let send = x.drain(..).collect::<Vec<String>>();

                if let Some(ws) = WS.as_mut() {
                    for msg in send {
                        ws.write_message(tungstenite::Message::Text(msg))
                            .unwrap_or(());
                    }
                }
            }

            if let Ok(msg) = rx.try_recv() {
                self.load_into(msg);
            }

            std::thread::sleep(std::time::Duration::from_millis(20));
        }
    }
}

pub fn get_ws_port() -> Option<u64> {
    let file = format!(
        "{}\\ProgramData\\AHQ Store Applications\\server.zLsMCFKchEXbnpBDkcJjFXYoapkpXeYDJygFJqXo",
        get_system_dir()
    );

    if let Ok(x) = read_to_string(file) {
        if let Ok(x) = from_str::<Vec<u8>>(&x) {
            if let Some(x) = decrypt(include!("./encrypt").as_bytes(), &x) {
                if let Ok(x) = String::from_utf8(x) {
                    if let Ok(x) = x.parse::<u64>() {
                        return Some(x);
                    }
                }
            }
        }
    }

    None
}

pub unsafe fn init<'a>(window: tauri::Window, reinstall_astore: fn() -> ()) {
    spawn(move || {
        WINDOW = Some(window);

        let port = get_ws_port().unwrap_or(0);

        if port == 0 {
            reinstall_astore();
            return;
        }

        let port_data = format!("ws://127.0.0.1:{}", &port);

        let connection = WsConnection::new(port_data, &|| {
            TERMINATED = true;
        });

        CONNECTION = Some(connection);

        if let Some(win) = WINDOW.as_mut() {
            win.listen("ws_send", |ev| {
                if let Some(x) = ev.payload() {
                    if let Ok(from_window) = from_str::<PayloadReq>(x) {
                        let reqwest = Req {
                            data: from_window.data,
                            module: from_window.module,
                            token: include!("./encrypt").into(),
                        };
                        CONNECTION.as_mut().unwrap().send_ws(reqwest);
                    }
                }
            });
        }

        spawn(|| CONNECTION.as_mut().unwrap().start());

        loop {
            if let Some(resp) = CONNECTION.as_mut().unwrap().recv() {
                if let Some(win) = WINDOW.as_mut() {
                    win.emit("ws_resp", to_string(&resp).unwrap_or(String::from("[]")))
                        .unwrap_or(());
                }
            }
            if TERMINATED {
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(100));
        }

        reinstall_astore();
        panic!("Terminated");
    });
}
