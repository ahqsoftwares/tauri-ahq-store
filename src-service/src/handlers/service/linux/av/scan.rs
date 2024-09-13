use std::thread::JoinHandle;

pub type Malicious = bool;

pub fn scan_threaded<T>(_p: &T) -> JoinHandle<Option<Malicious>> {
  std::thread::spawn(|| Some(false))
}
