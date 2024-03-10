use std::fs::remove_file;

use interprocess::local_socket::LocalSocketListener;

pub mod auth;
mod daemon;
pub mod utils;

use utils::{log, warn};

pub fn main() -> Option<()> {
  let bind_name = "/ahqstore/service_logger";

  let _ = remove_file(&bind_name);

  let socket = LocalSocketListener::bind(bind_name).ok()?;
  socket.set_nonblocking(true).ok()?;

  log("Looking for Listeners");

  loop {
    if let Ok(stream) = socket.accept() {
      if let None = daemon::accept(stream, 0) {
        warn("Unable to accept a stream");
      }
    }
  }
}
