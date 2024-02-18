use interprocess::os::windows::named_pipe::DuplexMsgPipeStream;

use serde_json::from_str;
use std::{
  ffi::OsStr,
  io::{ErrorKind, Read, Write},
  sync::{Arc, Mutex},
  thread::spawn,
  time::Duration,
};

static mut CONNECTION: Option<WsConnection> = None;
static mut WINDOW: Option<tauri::Window> = None;

static mut LAST_CMD: Option<String> = None;

#[allow(unused)]
struct WsConnection {
  to_send: Arc<Mutex<Vec<String>>>,
  pending: Arc<Mutex<Vec<String>>>,
}

unsafe impl Send for WsConnection {}
unsafe impl Sync for WsConnection {}

impl WsConnection {
  pub fn new() -> Self {
    unsafe {
      LAST_CMD = Some("".into());
    }

    Self {
      to_send: Arc::new(Mutex::new(vec![])),
      pending: Arc::new(Mutex::new(vec![])),
    }
  }

  pub fn send_ws(&mut self, value: &str) {
    unsafe {
      if let Some(x) = &LAST_CMD {
        if &x != &value {
          let to_send = self.to_send.clone();

          if let Ok(mut send) = to_send.try_lock() {
            LAST_CMD = Some(value.into());
            send.push(value.into());
          } else {
            std::thread::sleep(std::time::Duration::from_millis(10));
            self.send_ws(value);
          };
        }
      }
    }
  }

  pub fn recv(&mut self) -> Option<Vec<String>> {
    if let Ok(mut pending) = self.pending.try_lock() {
      Some({
        let data: Vec<String> = pending.drain(..).into_iter().collect();

        #[cfg(debug_assertions)]
        if data.len() > 0 {
          println!("{:?}", &data);
        }

        data
      })
    } else {
      None
    }
  }

  fn load_into(&mut self, msg: String) {
    let pending = self.pending.clone();

    if let Ok(mut x) = pending.try_lock() {
      #[cfg(debug_assertions)]
      if msg.len() > 0 {
        println!("{:?}", &msg);
      }

      x.push(msg);
    } else {
      std::thread::sleep(std::time::Duration::from_millis(1000));
      self.load_into(msg);
    };
  }

  pub unsafe fn start(&mut self, reinstall_astore: fn()) {
    let path = OsStr::new(r"ahqstore-service-api-v3");

    match DuplexMsgPipeStream::connect(path) {
      Ok(mut ipc) => {
        let mut len: [u8; 8] = [0; 8];
        loop {
          // Reading Pending Messages
          match ipc.read_exact(&mut len) {
            Ok(_) => {
              let mut data: Vec<u8> = vec![];
              data.resize(usize::from_be_bytes(len), 0);

              match ipc.read_exact(&mut data) {
                Ok(()) => {
                  #[cfg(debug_assertions)]
                  println!("{} - {}", data.len(), usize::from_be_bytes(len));

                  if data.len() == usize::from_be_bytes(len) {
                    let stri = String::from_utf8_lossy(&data);
                    let stri = stri.to_string();

                    self.load_into(stri);
                  } else {
                    println!("Packet Rejected!");
                  }
                }
                Err(e) => match e.kind() {
                  ErrorKind::WouldBlock => {}
                  e => {
                    println!("Fetch {e:?}");
                    break;
                  }
                },
              }
            }
            Err(e) => {
              println!("{:?}", &e);
              match e.kind() {
              ErrorKind::WouldBlock => {}
              _ => break,
            }},
          }

          //Sending Messages
          if let Ok(ref mut x) = self.to_send.try_lock() {
            let send = x.drain(..).collect::<Vec<String>>();

            for msg in send {
              let len = msg.len().to_be_bytes();
              let _ = ipc.write_all(&len);

              let _ = ipc.write_all(msg.as_bytes());

              let _ = ipc.flush();
            }
          }

          //Sleep
          std::thread::sleep(Duration::from_millis(1));
        }
        reinstall_astore();
      }
      e => {
        println!("{e:?}");
        reinstall_astore();
      }
    }

    // let server = self.binding_server.clone().to_string();
    // match connect(server) {
    //   Ok(websocket) => {
    //     WS = Some(websocket.0);

    //     spawn(move || {
    //       if let Some(ws) = WS.as_mut() {
    //         loop {
    //           if let Ok(msg) = ws.read() {
    //             if let Ok(txt) = msg.to_text() {
    //               println!("{}", &txt);
    //               let _ = tx.send(txt.into());
    //             }
    //           } else {
    //             let _ = tx.send("DISCONNECT".into());
    //             break;
    //           }
    //           std::thread::sleep(std::time::Duration::from_millis(1));
    //         }
    //       }
    //     });

    //     //Handle Read + Write at high speed

    //     if let Some(ws) = WS.as_mut() {
    //       let _ = ws.send(Message::Text(format!(
    //         "{{ \"process\": {} }}",
    //         std::process::id()
    //       )));
    //       loop {
    //         if let Ok(ref mut x) = self.to_send.try_lock() {
    //           let _ = ws.send(Message::text("KA"));

    //           let send = x.drain(..).collect::<Vec<String>>();

    //           for msg in send {
    //             ws.send(tungstenite::Message::Text(msg)).unwrap_or(());
    //           }
    //         }

    //         if let Ok(msg) = rx.try_recv() {
    //           if &msg == "DISCONNECT" {
    //             reinstall_astore();
    //             break;
    //           } else {
    //             self.load_into(msg);
    //           }
    //         }

    //         std::thread::sleep(std::time::Duration::from_millis(1));
    //       }
    //     }
    //   }
    //   Err(e) => {
    //     println!("{e:?}");
    //     reinstall_astore();
    //   }
    // }
  }
}

pub unsafe fn init<'a>(window: tauri::Window, reinstall_astore: fn()) {
  spawn(move || {
    WINDOW = Some(window);

    let connection = WsConnection::new();

    CONNECTION = Some(connection);

    if let Some(win) = WINDOW.as_mut() {
      win.listen("ws_send", |ev| {
        if let Some(x) = ev.payload() {
          if let Ok(x) = from_str::<String>(x) {
            CONNECTION.as_mut().unwrap().send_ws(&x);
          }
        }
      });
    }

    let ras = reinstall_astore.clone();
    spawn(move || CONNECTION.as_mut().unwrap().start(ras));

    loop {
      if let Some(resp) = CONNECTION.as_mut().unwrap().recv() {
        if resp.len() > 0 {
          if let Some(win) = WINDOW.as_mut() {
            win.emit("ws_resp", &resp).unwrap_or(());
          }
        }
      }
      std::thread::sleep(std::time::Duration::from_millis(10));
    }
  });
}
