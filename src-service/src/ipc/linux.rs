use std::{fs, io::ErrorKind};

use tokio::{io::AsyncWriteExt, net::UnixListener};

use crate::{
  authentication::authenticate_process,
  handlers::{handle_msg, GET_INSTALL_DAEMON},
  utils::{chmod, get_iprocess, set_iprocess, write_log},
};
use ahqstore_types::Command;

pub async fn launch() {
  let _ = GET_INSTALL_DAEMON.send(Command::GetSha(0));

  println!("STARTING UP");
  [
    "/ahqstore",
    "/ahqstore/Installers",
    "/ahqstore/Programs",
    "/ahqstore/Updaters",
  ]
  .iter()
  .for_each(|x| {
    let _ = fs::create_dir_all(x);
  });

  chmod("655", "/ahqstore/").unwrap();

  let _ = fs::remove_file("/ahqstore/socket");
  let socket = UnixListener::bind("/ahqstore/socket").unwrap();

  chmod("777", "/ahqstore/socket").unwrap();

  while let Ok((stream, _)) = socket.accept().await {
    set_iprocess(stream);

    let pipe = get_iprocess().unwrap();
    let Ok(cred) = pipe.peer_cred() else {
      let _ = pipe.shutdown().await;
      continue;
    };

    let Some(pid) = cred.pid() else {
      let _ = pipe.shutdown().await;
      continue;
    };

    if pid <= 0 {
      let _ = pipe.shutdown().await;
      continue;
    }

    if !authenticate_process(pid as usize, true) {
      println!("FAILED CHECK");
      let _ = pipe.shutdown().await;
      println!("DISCONNECT");
      continue;
    }

    let mut ext: u8 = 0;
    'a: loop {
      ext += 1;
      if ext > 20 {
        ext = 0;
        if !authenticate_process(pid as usize, false) {
          let _ = pipe.shutdown().await;
          println!("DISCONNECT");
          break 'a;
        }
      }

      let mut val: [u8; 8] = [0u8; 8];

      match pipe.try_read(&mut val) {
        Ok(0) => {}
        Ok(_) => {
          let total = usize::from_be_bytes(val);

          let mut buf: Vec<u8> = Vec::new();
          let mut byte = [0u8];

          for _ in 0..total {
            match pipe.try_read(&mut byte) {
              Ok(_) => {
                buf.push(byte[0]);
              }
              Err(e) => match e.kind() {
                ErrorKind::WouldBlock => {}
                e => {
                  let err = format!("{e:?}");

                  write_log(&err);
                  if &err != "Uncategorized" {
                    let _ = pipe.shutdown().await;
                    break 'a;
                  }
                }
              },
            }
          }
          handle_msg(String::from_utf8_lossy(&buf).to_string());
        }
        Err(e) => match e.kind() {
          ErrorKind::WouldBlock => {}
          e => {
            let err = format!("{e:?}");
            println!("{}", &err);

            write_log(&err);
            if &err != "Uncategorized" {
              let _ = pipe.shutdown().await;
              break 'a;
            }
          }
        },
      }
    }
  }
}
