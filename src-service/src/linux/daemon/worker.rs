use std::{thread, sync::mpsc::{channel, Sender, Receiver}};
use ahqstore_types::Command;

use crate::linux::utils::sleep;

pub enum ServerAction {
  Forget,
}

pub fn establish_worker() -> (Sender<Vec<(u64, String)>>, Receiver<(u64, Command, ServerAction)>) {
  let (tx, rx_inner) = channel::<Vec<(u64, String)>>();
  let (tx_inner, rx) = channel::<(u64, Command, ServerAction)>();

  thread::spawn(move || {
    loop {
      sleep(Some(30));
    }
  });

  (tx, rx)
}