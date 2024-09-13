use std::thread::JoinHandle;

pub type Malicious = bool;

pub fn scan_threaded<T>(_p: &T) -> JoinHandle<Malicious> {
  std::thread::spawn(|| false)
}
