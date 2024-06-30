use std::thread::JoinHandle;

mod http;
mod prefs;

pub enum UninstallResult {
  Thread(JoinHandle<Option<String>>),
  Sync(Option<String>),
}

pub use http::*;
pub use prefs::*;

#[cfg(windows)]
mod win32;

#[cfg(windows)]
pub use win32::*;

#[cfg(unix)]
mod linux;

#[cfg(unix)]
pub use linux::*;
