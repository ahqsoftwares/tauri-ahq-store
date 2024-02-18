use std::{
  ffi::{c_void, OsStr},
  io::ErrorKind,
  os::windows::io::AsRawHandle,
  ptr,
  time::Duration,
};
use tokio::{
  io::AsyncReadExt,
  net::windows::named_pipe::{PipeMode, ServerOptions},
  time::sleep,
};
use windows::Win32::{
  Foundation::HANDLE,
  Security::{
    InitializeSecurityDescriptor, SetSecurityDescriptorDacl, PSECURITY_DESCRIPTOR,
    SECURITY_ATTRIBUTES, SECURITY_DESCRIPTOR,
  },
  System::Pipes::GetNamedPipeClientProcessId,
  System::SystemServices::SECURITY_DESCRIPTOR_REVISION,
};

use super::{
  authentication::authenticate_process,
  handlers::handle_msg,
  utils::{get_iprocess, set_iprocess, write_log},
};

pub async fn launch() {
  write_log("Starting");
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
      let handle = pipe.as_raw_handle();

      let mut process_id = 0u32;

      unsafe {
        let handle = HANDLE(handle as isize);

        let _ = GetNamedPipeClientProcessId(handle, &mut process_id as *mut _);
      }

      if !authenticate_process(process_id as usize) {
        let _ = pipe.disconnect();
      } else {
        'a: loop {
          let mut val: [u8; 8] = [0u8; 8];
          //let mut buf: Box<[u8]>;

          match pipe.read_exact(&mut val).await {
            Ok(8) => {
              let total = usize::from_be_bytes(val);

              let mut buf: Vec<u8> = Vec::new();
              buf.resize(total, 0);

              match pipe.read_exact(&mut buf).await {
                Ok(t) => {
                  if t == total {
                    handle_msg(String::from_utf8_lossy(&buf).to_string());
                  }
                }
                Err(e) => match e.kind() {
                  ErrorKind::WouldBlock => {}
                  e => {
                    write_log(format!("{e:?}"));
                    let _ = pipe.disconnect();
                    break 'a;
                  }
                },
              }
            }
            Err(e) => match e.kind() {
              ErrorKind::WouldBlock => {}
              _ => {
                let _ = pipe.disconnect();
                break 'a;
              }
            },
            _ => {}
          }
          // match pipe.try_read_buf(&mut val) {
          //   Ok(8) => {}
          //   Err(e) => match e.kind() {
          //     ErrorKind::WouldBlock => {}
          //     _ => {
          //       let _ = pipe.disconnect();
          //       break 'a;
          //     }
          //   },
          //   _ => {}
          // }
        }
      }
    }
    sleep(Duration::from_millis(2)).await;
  }
}
// pub async fn launch() {
//   let pipe: PipeListener<DuplexMsgPipeStream> = PipeListenerOptions::new()
//     .name(OsStr::new("ahqstore-service-api-v3"))
//     .nonblocking(true)
//     .instance_limit(NonZeroU8::new(1))
//     .mode(PipeMode::Messages)
//     .create()
//     .unwrap();

//   loop {
//     if let Ok(stream) = pipe.accept() {
//       println!("Connect");
//       write_log("Found");
//       let _ = stream.set_nonblocking(true);

//       if let Ok(v) = stream.client_process_id() {
//         if !authenticate_process(v as usize) {
//           write_log("Cancelling");
//           let _ = stream.disconnect_without_flushing();
//           write_log("removed");
//         } else {
//           set_iprocess(stream);

//           let stream = get_iprocess().unwrap();

//           loop {
//             let mut len: [u8; 8] = [0; 8];
//             match stream.read_exact(&mut len) {
//               Err(e) => match e.kind() {
//                 ErrorKind::Unsupported | ErrorKind::UnexpectedEof => {
//                   remove_iprocess();
//                   break;
//                 }
//                 _ => {}
//               },
//               _ => {}
//             };

//             let len = usize::from_be_bytes(len);
//             let mut buffer: Box<[u8]> = vec![0; len].into_boxed_slice();

//             match stream.read_exact(&mut buffer) {
//               Err(e) => match e.kind() {
//                 ErrorKind::Unsupported | ErrorKind::UnexpectedEof => {
//                   remove_iprocess();
//                   break;
//                 }
//                 _ => {}
//               },
//               _ => {}
//             };

//             let string = String::from_utf8_lossy(&buffer);

//             let len = string.len().to_be_bytes();

//             let _ = stream.write_all(&len);
//             let _ = stream.write_all(string.as_bytes());
//             let _ = stream.flush();

//             sleep(Duration::from_nanos(2)).await;
//           }
//         }
//       } else {
//         write_log("Client ID not fetched");
//         let _ = stream.disconnect_without_flushing();
//       }
//     }
//   }
// }
