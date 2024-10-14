use std::{process::Child, thread::JoinHandle};
use tokio::task::JoinHandle as TokioJoinHandle;

mod http;
mod prefs;

pub enum UninstallResult {
  Thread(JoinHandle<bool>),
  Sync(Option<String>),
}

pub enum InstallResult {
  Thread(TokioJoinHandle<Option<()>>),
  Child(Child),
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
