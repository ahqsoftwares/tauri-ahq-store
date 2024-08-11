use std::thread::JoinHandle;

mod http;
mod prefs;

pub enum UninstallResult {
  Thread(JoinHandle<bool>),
  Sync(Option<String>),
}

pub use http::*;
pub use prefs::*;

#[cfg(windows)]
mod windows;

#[cfg(windows)]
pub use windows::*;

#[cfg(unix)]
mod linux;

#[cfg(unix)]
pub use linux::*;
