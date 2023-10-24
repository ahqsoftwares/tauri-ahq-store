#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(windows)]
mod windows;

fn main() {
  #[cfg(windows)]
  windows::main();
}
