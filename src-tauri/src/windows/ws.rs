use async_recursion::async_recursion;

use tokio::io::AsyncWriteExt;
use tokio::net::windows::named_pipe::{ClientOptions, PipeMode};
use tokio::sync::Mutex;

use serde_json::from_str;
use std::sync::Arc;
use std::thread;
use std::{ffi::OsStr, io::ErrorKind, thread::spawn, time::Duration};

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
            thread::sleep(std::time::Duration::from_millis(1));
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
      thread::sleep(std::time::Duration::from_millis(1000));
      self.load_into(msg);
    };
  }

  #[async_recursion]
  pub async unsafe fn start(&mut self, reinstall_astore: fn(), tries: u8) {
    let path = OsStr::new(r"\\.\pipe\ahqstore-service-api-v3");

    let reinstall = || async {
      if tries > 5 {
        reinstall_astore();
        false
      } else {
        true
      }
    };

    match ClientOptions::new().pipe_mode(PipeMode::Message).open(path) {
      Ok(mut ipc) => {
        let mut len: [u8; 8] = [0; 8];
        loop {
          println!("WS Loop");

          // Reading Pending Messages
          match ipc.try_read(&mut len) {
            Ok(8) => {
              let size = usize::from_be_bytes(len);
              println!("{size}");

              let mut data: Vec<u8> = vec![];
              let mut bit = [0u8];

              for _ in 0..size {
                match ipc.try_read(&mut bit) {
                  Ok(1) => {
                    data.push(bit[0]);
                  }
                  Err(e) => match e.kind() {
                    ErrorKind::WouldBlock => {}
                    e => {
                      println!("Byte: {e:?}");
                      if &format!("{e:?}") != "Uncategorized" {
                        break;
                      }
                    }
                  }
                  _ => {}
                }
              }

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
            Ok(t) => {
              println!("{t}");
              break;
            }
            Err(e) => match e.kind() {
              ErrorKind::WouldBlock => {}
              e => {
                println!("Len: {e:?}");
                if &format!("{e:?}") != "Uncategorized" {
                  break;
                }
              }
            }
          }

          //Sending Messages
          if let Ok(ref mut x) = self.to_send.try_lock() {
            let send = x.drain(..).collect::<Vec<String>>();

            for msg in send {
              let len = msg.len().to_be_bytes();

              println!("{:?}", &len);

              ipc.write(&len).await.unwrap();
              ipc.write_all(msg.as_bytes()).await.unwrap();

              ipc.flush().await.unwrap();
            }
          }
        }
        drop(ipc);
        if reinstall().await {
          self.start(reinstall_astore, tries + 1).await;
        }
      }
      e => {
        println!("{tries}: {e:?}");
        if reinstall().await {
          self.start(reinstall_astore, tries + 1).await;
        }
      }
    }
  }
}

pub unsafe fn init<'a>(window: tauri::Window, reinstall_astore: fn()) {
  spawn(move || {
    let rt = tokio::runtime::Builder::new_current_thread().worker_threads(5).enable_all().build().unwrap();
    rt.block_on(async move {
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
      unsafe { CONNECTION.as_mut().unwrap().start(ras, 0).await };

      loop {
        if let Some(resp) = CONNECTION.as_mut().unwrap().recv() {
          if resp.len() > 0 {
            if let Some(win) = WINDOW.as_mut() {
              win.emit("ws_resp", &resp).unwrap_or(());
            }
          }
        }
      }
    });
  });
}
