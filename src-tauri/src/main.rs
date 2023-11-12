#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod rpc;
#[macro_use]
pub mod encryption;
pub mod structs;

#[cfg(windows)]
mod windows;

#[cfg(target_os = "linux")]
mod linux;

fn main() {
  #[cfg(windows)]
  windows::main();

  #[cfg(target_os = "linux")]
  linux::main();
}
