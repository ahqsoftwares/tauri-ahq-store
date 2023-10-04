use serde_json::{from_str, to_string};
use std::{
  fs,
  net::TcpStream,
  sync::{Arc, Mutex},
  thread::spawn,
};
use tungstenite::{connect, stream::MaybeTlsStream, WebSocket, Message};

use ahqstore_types::Response;

use crate::{
  encryption::decrypt,
  get_system_dir,
  util::structs::PayloadReq,
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

  pub fn send_ws(&mut self, value: PayloadReq) {
    if let Ok(ref mut _a) = self.to_send.try_lock() {
      match value.module.as_str() {
        _ => {}
      }
    }
  }

  pub fn recv(&mut self) -> Option<Vec<String>> {
    if let Ok(mut pending) = self.pending.try_lock() {
      Some({
        let mut data = pending
          .drain(..)
          .into_iter()
          .map(|x| {
            if let Ok(x) = from_str::<Vec<u8>>(&x) {
              if let Some(x) = decrypt(x) {
                #[cfg(debug_assertions)]
                println!("{:?}", &x);
                return x;
              }
            }
            x
          })
          .map(|x| {
            if let Ok(payload) = from_str::<Response>(&x) {
              println!("{:?}", &payload);
              // let string = to_string(&ToSendResp {
              //   method: payload.method,
              //   payload: payload.payload,
              //   reason: payload.reason,
              //   ref_id: payload.ref_id.replace(include!("./encrypt"), "****"),
              //   status: payload.status,
              // })
              // .unwrap_or_else(|_| "{}".into());

              // unsafe {
              //   let _ = WINDOW.as_mut().unwrap().emit("error", &string);
              // }

              // return string;
            }

            "{}".into()
          })
          .collect::<Vec<String>>();

        data.sort_by(|a, b| {
          use std::cmp::Ordering;

          let a_is_terminate = a.to_lowercase().contains("terminate");
          let b_is_terminate = b.to_lowercase().contains("terminate");

          if a_is_terminate && b_is_terminate {
            Ordering::Equal
          } else if a_is_terminate {
            Ordering::Greater
          } else {
            Ordering::Less
          }
        });

        data
      })
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

  pub unsafe fn start(&mut self, reinstall_astore: fn()) {
    let (tx, rx) = std::sync::mpsc::channel::<String>();
    let server = self.binding_server.clone().to_string();
    if let Ok(websocket) = connect(server) {
      WS = Some(websocket.0);

      spawn(move || {
        if let Some(ws) = WS.as_mut() {
          loop {
            if let Ok(msg) = ws.read() {
              if let Ok(txt) = msg.to_text() {
                let _ = tx.send(txt.into());
              }
            } else {
              let _ = tx.send("DISCONNECT".into());
              break;
            }
            std::thread::sleep(std::time::Duration::from_millis(1));
          }
        }
      });

      //Handle Read + Write at high speed
      
      if let Some(ws) = WS.as_mut() {
        let _ = ws.send(
          Message::Text(
            format!("{{ \"process\": {} }}", std::process::id())
          )
        );
        loop {
          if let Ok(ref mut x) = self.to_send.try_lock() {
            let send = x.drain(..).collect::<Vec<String>>();

            let _ = ws.send(Message::text("KA"));
            for msg in send {
              ws.send(tungstenite::Message::Text(msg)).unwrap_or(());
            }
          }

          if let Ok(msg) = rx.try_recv() {
            println!("{}", &msg);
            self.load_into(msg);
          }

          std::thread::sleep(std::time::Duration::from_millis(20));
        }
      }
    } else {
      reinstall_astore();
    }
  }
}

pub fn get_ws_port() -> Option<u64> {
  let file = format!(
    "{}\\ProgramData\\AHQ Store Applications\\service.encrypted.txt",
    get_system_dir()
  );

  if let Ok(x) = fs::read(file) {
    if let Some(x) = decrypt(x) {
      if let Ok(x) = x.parse::<u64>() {
        return Some(x);
      }
    }
  }

  None
}

pub unsafe fn init<'a>(window: tauri::Window, reinstall_astore: fn()) {
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
            CONNECTION.as_mut().unwrap().send_ws(from_window);
          }
        }
      });
    }

    let ras = reinstall_astore.clone();
    spawn(move || CONNECTION.as_mut().unwrap().start(ras));

    loop {
      if let Some(resp) = CONNECTION.as_mut().unwrap().recv() {
        if let Some(win) = WINDOW.as_mut() {
          win
            .emit("ws_resp", to_string(&resp).unwrap_or(String::from("[]")))
            .unwrap_or(());
        }
      }
      if TERMINATED {
        break;
      }
      std::thread::sleep(std::time::Duration::from_millis(1));
    }

    reinstall_astore();
    panic!("Terminated");
  });
}
