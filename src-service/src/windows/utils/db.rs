use tokio::net::windows::named_pipe::NamedPipeServer;

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
  let mut data = len.to_vec();

  for byte in val {
    data.push(*byte);
  }

  let _ = ipc.try_write(&data);
}
