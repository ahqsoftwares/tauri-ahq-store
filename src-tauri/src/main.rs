#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(static_mut_refs)]

pub mod rpc;
#[macro_use]
pub mod encryption;
pub mod structs;

mod app;

fn main() {
  app::main();
}
