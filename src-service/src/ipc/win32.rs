use std::{
  ffi::{c_void, OsStr},
  io::ErrorKind,
  os::windows::io::AsRawHandle,
  ptr,
  time::Duration,
};
use tokio::net::windows::named_pipe::{PipeMode, ServerOptions};

use windows::Win32::{
  Foundation::HANDLE,
  Security::{
    InitializeSecurityDescriptor, SetSecurityDescriptorDacl, PSECURITY_DESCRIPTOR,
    SECURITY_ATTRIBUTES, SECURITY_DESCRIPTOR,
  },
  System::Pipes::GetNamedPipeClientProcessId,
  System::SystemServices::SECURITY_DESCRIPTOR_REVISION,
};

use crate::{
  authentication::authenticate_process,
  handlers::{handle_msg, GET_INSTALL_DAEMON},
  utils::{get_iprocess, set_iprocess, write_log},
};
use ahqstore_types::Command;

pub async fn launch() {
  write_log("Starting");
  let _ = GET_INSTALL_DAEMON.send(Command::GetSha(0));

  let mut obj = SECURITY_DESCRIPTOR::default();
  // make it have full rights over the named pipe
  unsafe {
    InitializeSecurityDescriptor(
      PSECURITY_DESCRIPTOR(&mut obj as *mut _ as *mut c_void),
      SECURITY_DESCRIPTOR_REVISION,
    )
    .unwrap();

    SetSecurityDescriptorDacl(
      PSECURITY_DESCRIPTOR(&mut obj as *mut _ as *mut c_void),
      true,
      Some(ptr::null()),
      false,
    )
    .unwrap();
  }

  let mut attr = SECURITY_ATTRIBUTES::default();
  attr.lpSecurityDescriptor = &mut obj as *mut _ as *mut c_void;

  let pipe = unsafe {
    ServerOptions::new()
      .first_pipe_instance(true)
      .reject_remote_clients(true)
      .pipe_mode(PipeMode::Message)
      .create_with_security_attributes_raw(
        OsStr::new(r"\\.\pipe\ahqstore-service-api-v3"),
        &mut attr as *mut _ as *mut c_void,
      )
      .unwrap()
  };

  set_iprocess(pipe);

  write_log("Started");

  let pipe = get_iprocess().unwrap();
  loop {
    write_log("Loop");
    if let Ok(()) = pipe.connect().await {
      println!("Connected");
      let handle = pipe.as_raw_handle();

      let mut process_id = 0u32;

      unsafe {
        let handle = HANDLE(handle as isize);

        let _ = GetNamedPipeClientProcessId(handle, &mut process_id as *mut _);
      }

      if !authenticate_process(process_id as usize, true) {
        println!("Unauthenticated");
        let _ = pipe.disconnect();
      } else {
        let mut ext: u8 = 0;
        'a: loop {
          let mut val: [u8; 8] = [0u8; 8];
          //let mut buf: Box<[u8]>;

          ext += 1;
          if ext >= 20 {
            ext = 0;
            if !authenticate_process(process_id as usize, false) {
              println!("Unauthenticated");
              let _ = pipe.disconnect();
              break 'a;
            }
          }

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
                        let _ = pipe.disconnect();
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

                write_log(&err);
                if &err != "Uncategorized" {
                  let _ = pipe.disconnect();
                  break 'a;
                }
              }
            },
          }
          tokio::time::sleep(Duration::from_millis(100)).await;
        }
      }
    }
    tokio::time::sleep(Duration::from_millis(100)).await;
  }
}
