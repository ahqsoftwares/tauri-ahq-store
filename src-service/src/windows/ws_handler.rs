use std::time::Duration;

use ahqstore_types::{Reason, Response};
use tokio::{io::AsyncWriteExt, net::TcpListener, spawn, task::JoinHandle};

use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::accept_async;

use crate::windows::{
  authentication::authenticate_process,
  utils::{get_ws, now, remove_ws, set_ws, structs::AuthPing, write_log, write_service, ServiceWs},
};

use crate::windows::handlers;

static MAX_WS: u64 = 1;

static mut CURRENT_WS: u64 = 0;

static mut VERIFIED: bool = false;

static mut CONNECTED: u64 = 0;
static mut LAST_CONTACTED: u64 = 0;

static mut HANDLE: Option<JoinHandle<()>> = None;

unsafe fn standard_remove() {
  VERIFIED = false;
  if CURRENT_WS > 0 {
    CURRENT_WS = 0;
  }
  LAST_CONTACTED = 0;
  remove_ws();

  if let Some(handle) = &HANDLE {
    handle.abort();
  }
  HANDLE = None;
}

pub async fn launch() {
  write_log("SERVER - RUNNING PREP");

  let server = TcpListener::bind(("127.0.0.1", 0)).await.unwrap();

  write_log("SERVER - RUNNING");

  let port = server.local_addr().unwrap().port();
  write_service(port);

  loop {
    if let Ok((mut stream, _)) = server.accept().await {
      let should_continute = async {
        unsafe {
          if CURRENT_WS + 1 > MAX_WS {
            if now() - LAST_CONTACTED > 1 {
              return {
                if let Some(x) = get_ws() {
                  let _ = x.flush().await;
                  let _ = x.close().await;
                }
                standard_remove();
                true
              };
            } else {
              false
            }
          } else {
            true
          }
        }
      }
      .await;

      if !should_continute {
        let _ = stream.write_all(b"ERR: TOO MANY REQUESTS");
      } else {
        let ws = accept_async(stream).await.ok();

        unsafe {
          CURRENT_WS += 1;
          LAST_CONTACTED = now();
          CONNECTED = now();
          VERIFIED = false;
        }

        if let Some(ws) = ws {
          let (sender, mut recv) = ws.split();

          set_ws(sender);

          let handle = spawn(async move {
            let stop = |ws: &'static mut ServiceWs| unsafe {
              async {
                let _ = ws.flush().await;
                let _ = ws.close().await;
                standard_remove();
              }
            };

            'a: loop {
              if let Some(Ok(x)) = recv.next().await {
                if let Some(ws) = get_ws() {
                  if let Ok(x) = x.to_text() {
                    let x = x.to_string();
                    unsafe {
                      if VERIFIED {
                        if &x == "KA" {
                          LAST_CONTACTED = now();
                        } else {
                          handlers::handle_msg(x, || {
                            standard_remove();
                          });
                        }
                      } else {
                        if let Some(x) = AuthPing::from(x) {
                          if authenticate_process(x.process) {
                            LAST_CONTACTED = now();
                            VERIFIED = true;

                            let _ = ws.send(Response::as_msg(Response::Ready)).await;
                          } else {
                            stop(ws).await;
                            break 'a;
                          }
                        } else {
                          let _ = ws
                            .send(Response::as_msg(Response::Disconnect(
                              Reason::Unauthenticated,
                            )))
                            .await;
                          stop(ws).await;
                          break 'a;
                        }
                      }
                    }
                  } else {
                    stop(ws).await;
                    break 'a;
                  }
                } else {
                  break 'a;
                }
              }
              tokio::time::sleep(Duration::from_nanos(1)).await;
            }
          });

          unsafe {
            HANDLE = Some(handle);
          }

          spawn(async move {
            unsafe {
              loop {
                if VERIFIED {
                  break;
                }
                if !VERIFIED && (now() - LAST_CONTACTED) > 30 {
                  if let Some(ws) = get_ws() {
                    let _ = ws.flush().await;
                    let _ = ws.close().await;
                  }
                  standard_remove();
                  break;
                }
                tokio::time::sleep(Duration::from_millis(1000)).await;
              }
            }
          });
        }
      }
    }
  }
}
