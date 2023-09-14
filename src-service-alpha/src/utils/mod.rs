use std::{
    net::TcpListener,
    time::{SystemTime, UNIX_EPOCH},
};

mod db;
mod log_file;

pub use db::*;
pub use log_file::*;

pub mod structs;

pub fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

pub fn get_available_port() -> Option<u16> {
    (49152..65535).find(|port| port_is_available(*port))
}

fn port_is_available(port: u16) -> bool {
    match TcpListener::bind(("127.0.0.1", port)) {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub fn get_main_drive() -> String {
    std::env::var("SystemDrive")
        .unwrap_or("C:".into())
        .to_string()
}
