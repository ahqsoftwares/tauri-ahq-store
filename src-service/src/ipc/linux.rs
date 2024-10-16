use std::time::Duration;
use std::{fs, io::ErrorKind};
use tokio::{io::AsyncWriteExt, net::UnixListener};

use crate::{
  authentication::authenticate_process,
  handlers::{get_prefs, handle_msg, GET_INSTALL_DAEMON},
  utils::{chmod, get_iprocess, set_iprocess, set_perms, write_log},
};
use ahqstore_types::{Command, Prefs};

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

  loop {
    if let Ok((stream, _)) = socket.accept().await {
      println!("Got Stream");
      set_iprocess(stream);

      let pipe = get_iprocess().unwrap();
      let Ok(cred) = pipe.peer_cred() else {
        println!("Err 0x1");
        let _ = pipe.shutdown().await;
        continue;
      };

      let Some(pid) = cred.pid() else {
        println!("Err 0x2");
        let _ = pipe.shutdown().await;
        continue;
      };

      if pid <= 0 {
        println!("Err 0x3");
        let _ = pipe.shutdown().await;
        continue;
      }

      let (auth, sudoer) = authenticate_process(pid as usize, true);
      if !auth {
        println!("FAILED CHECK");
        let _ = pipe.shutdown().await;
        println!("DISCONNECT");
        continue;
      }

      set_perms((|| {
        if sudoer {
          return (true, true, true);
        }

        let Prefs {
          launch_app,
          install_apps,
          ..
        } = get_prefs();

        (sudoer, launch_app, install_apps)
      })());

      let mut ext: u8 = 0;
      'a: loop {
        ext += 1;
        if ext > 20 {
          ext = 0;
          if !authenticate_process(pid as usize, false).0 {
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

            println!("total: {total}");

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

            let msg = String::from_utf8_lossy(&buf).to_string();
            println!("Handling MSG");
            println!("{msg:?}");
            handle_msg(sudoer, msg);
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
        tokio::time::sleep(Duration::from_millis(100)).await;
      }
    } else {
      println!("socket.accept failed...");
    }
  }
}
