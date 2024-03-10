use std::{
  fmt::Debug,
  thread,
  time::{Duration, SystemTime, UNIX_EPOCH},
};

pub fn log<T: Debug>(data: T) {
  println!("LOGS: {data:?}")
}

pub fn warn(data: &'static str) {
  println!("WARN: {data:?}")
}

pub fn sleep(ms: Option<u64>) {
  thread::sleep(Duration::from_millis(ms.unwrap_or(2000)))
}

pub fn now() -> u64 {
  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap_or(Duration::from_secs(20))
    .as_secs()
}
