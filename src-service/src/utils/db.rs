#[cfg(windows)]
use tokio::net::windows::named_pipe::NamedPipeServer;

#[cfg(unix)]
use tokio::net::UnixStream;

#[cfg(windows)]
pub type ServiceIpc = NamedPipeServer;

#[cfg(unix)]
pub type ServiceIpc = UnixStream;

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
  let mut data = len.to_vec();

  for byte in val {
    data.push(*byte);
  }

  let _ = ipc.try_write(&data);
}
