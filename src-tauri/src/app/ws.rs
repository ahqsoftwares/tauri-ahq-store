use async_recursion::async_recursion;

#[cfg(windows)]
use tokio::net::windows::named_pipe::{ClientOptions, PipeMode};

#[cfg(unix)]
use tokio::net::UnixSocket;
use tokio::sync::Mutex;

use serde_json::from_str;
use std::sync::Arc;
use std::thread;
use std::{ffi::OsStr, io::ErrorKind, thread::spawn, time::Duration};

use tauri::Manager;

static mut CONNECTION: Option<WsConnection> = None;
static mut WINDOW: Option<tauri::WebviewWindow> = None;

static mut LAST_CMD: Option<String> = None;

#[allow(unused)]
struct WsConnection {
  to_send: Arc<Mutex<Vec<String>>>,
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
    }
  }

  pub fn send_ws(&mut self, value: &str) {
    unsafe {
      if let Some(x) = LAST_CMD.as_mut() {
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

  #[async_recursion]
  pub async unsafe fn start(&mut self, reinstall_astore: fn(), tries: u8) {
    let path = OsStr::new(r"\\.\pipe\ahqstore-service-api-v3");

    let reinstall = || async {
      tokio::time::sleep(Duration::from_millis(5)).await;
      if tries > 20 {
        reinstall_astore();
        false
      } else {
        true
      }
    };

    #[cfg(windows)]
    let ipc_gen_0x68 = ClientOptions::new().pipe_mode(PipeMode::Message).open(path);

    #[cfg(unix)]
    let ipc_gen_0x68 = UnixSocket::new_stream()
      .unwrap()
      .connect("/ahqstore/socket")
      .await;

    match ipc_gen_0x68 {
      Ok(ipc) => {
        let mut len: [u8; 8] = [0; 8];
        loop {
          // Reading Pending Messages
          match ipc.try_read(&mut len) {
            Ok(0) => {}
            Ok(8) => {
              let size = usize::from_be_bytes(len);

              let mut data: Vec<u8> = vec![];
              let mut bit = [0u8];

              let mut iter = 0i64;
              loop {
                iter += 1;
                if iter == i64::MAX {
                  reinstall_astore();
                }
                if data.len() == size {
                  break;
                }
                match ipc.try_read(&mut bit) {
                  Ok(_) => {
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
                  },
                }
              }

              if data.len() == usize::from_be_bytes(len) {
                let stri = String::from_utf8_lossy(&data);
                let stri = stri.to_string();

                if let Some(win) = WINDOW.as_mut() {
                  win.emit("ws_resp", &[stri]).unwrap_or(());
                }
              } else {
                println!("Packet Rejected!");
              }
            }
            Ok(t) => {
              println!("huh {t}");
              break;
            }
            Err(e) => match e.kind() {
              ErrorKind::WouldBlock => {}
              e => {
                println!("Len: {e:?}");
                break;
              }
            },
          }

          //Sending Messages
          if let Ok(ref mut x) = self.to_send.try_lock() {
            let send = x.drain(..).collect::<Vec<String>>();

            for msg in send {
              let len = msg.len().to_be_bytes();

              let mut data = vec![];
              for byte in len {
                data.push(byte);
              }
              for byte in msg.as_bytes() {
                data.push(*byte);
              }

              let _ = ipc.try_write(&data);
            }
          }
          tokio::time::sleep(Duration::from_nanos(1)).await;
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

pub unsafe fn init<'a>(window: &tauri::WebviewWindow, reinstall_astore: fn()) {
  let window: tauri::WebviewWindow = window.clone();
  spawn(move || {
    let rt = tokio::runtime::Builder::new_current_thread()
      .worker_threads(5)
      .enable_all()
      .build()
      .unwrap();
    rt.block_on(async move {
      WINDOW = Some(window);

      let connection = WsConnection::new();

      CONNECTION = Some(connection);

      if let Some(win) = WINDOW.as_mut() {
        win.listen("ws_send", |ev| {
          let x = ev.payload();
          if let Ok(x) = from_str::<String>(x) {
            CONNECTION.as_mut().unwrap().send_ws(&x);
          }
        });
      }

      let ras = reinstall_astore.clone();
      unsafe { CONNECTION.as_mut().unwrap().start(ras, 0).await };
    });
  });
}
