use tokio::{io::AsyncWriteExt, net::windows::named_pipe::NamedPipeServer};

pub type ServiceIpc = NamedPipeServer;

static mut IPC: Option<ServiceIpc> = None;

pub fn set_iprocess(ipc: ServiceIpc) {
  unsafe {
    IPC = Some(ipc);
  }
}

pub fn get_iprocess() -> Option<&'static mut ServiceIpc> {
  unsafe { IPC.as_mut() }
}

pub async fn ws_send(ipc: &mut &'static mut ServiceIpc, val: &[u8]) {
  let len = val.len().to_be_bytes();
  let _ = ipc.write_all(&len).await;
  let _ = ipc.write_all(val).await;
  let _ = ipc.flush().await;
}
