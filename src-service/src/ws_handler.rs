use std::time::Duration;

use ahqstore_types::{Reason, Response};
use tokio::{io::AsyncWriteExt, net::TcpListener, spawn, task::JoinHandle};

use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::accept_async;

use crate::{
  authentication::authenticate_process,
  utils::{write_service, get_ws, now, remove_ws, set_ws, structs::AuthPing, write_log, ServiceWs},
};

use crate::handlers;

static MAX_WS: u64 = 1;

static mut CURRENT_WS: u64 = 0;

static mut VERIFIED: bool = false;

static mut CONNECTED: u64 = 0;
static mut LAST_CONTACTED: u64 = 0;

static mut HANDLE: Option<JoinHandle<()>> = None;

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
            if now() - LAST_CONTACTED < 1 {
              return {
                if let Some(x) = get_ws() {
                  let _ = x.close().await;
                }
                remove_ws();
                if let Some(handle) = &HANDLE {
                  handle.abort();
                }
                HANDLE = None;
                true
              };
            }
          }

          false
        }
      }
      .await;

      if should_continute {
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

                VERIFIED = false;
                if CURRENT_WS > 0 {
                  CURRENT_WS -= 1;
                }
                LAST_CONTACTED = 0;
                remove_ws();
              }
            };

            'a: loop {
              if let Some(Ok(x)) = recv.next().await {
                if let Some(ws) = get_ws() {
                  if x.is_text() {
                    let x = x.to_text().unwrap().to_string();
                    unsafe {
                      if VERIFIED {
                        if &x == "KA" {
                          LAST_CONTACTED = now();
                        } else {
                          handlers::handle_msg(x, || {
                            VERIFIED = false;
                            if CURRENT_WS > 0 {
                              CURRENT_WS -= 1;
                            }
                            LAST_CONTACTED = 0;
                            remove_ws();
                          });
                        }
                      } else {
                        if let Some(x) = AuthPing::from(x) {
                          if authenticate_process(x.process) {
                            LAST_CONTACTED = now();
                            VERIFIED = true;

                            let _ = ws.send(Response::as_msg(Response::Ready)).await;
                          } else {
                            write_log("WS HANDLE: Broken Ping");
                            stop(ws).await;
                            break 'a;
                          }
                        } else {
                          write_log("WS HANDLE: Broken Ping");
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
                    write_log("WS HANDLE: WS unknown");
                    stop(ws).await;
                    break 'a;
                  }
                } else {
                  write_log("WS HANDLE: WS unable to be found!");
                  break 'a;
                }
              }
              tokio::time::sleep(Duration::from_millis(5)).await;
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
                if !VERIFIED && (now() - CONNECTED) > 5 {
                  write_log("WS STOPPER: Killing WS due to inactivity");
                  if let Some(ws) = get_ws() {
                    let _ = ws.flush().await;
                    let _ = ws.close().await;
                  }
                  if let Some(handle) = &HANDLE {
                    handle.abort();
                  }
                  HANDLE = None;
                  if CURRENT_WS > 0 {
                    CURRENT_WS -= 1;
                  }
                  remove_ws();
                  break;
                }
                tokio::time::sleep(Duration::from_millis(100)).await;
              }
            }
          });
        }
      }
    }
  }
}
