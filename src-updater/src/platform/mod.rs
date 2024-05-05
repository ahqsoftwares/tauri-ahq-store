use std::{fs::File, io::Write};

use lazy_static::lazy_static;
use reqwest::{Client, ClientBuilder};

lazy_static! {
  pub static ref CLIENT: Client = ClientBuilder::new()
    .user_agent("AHQ Store / Updater")
    .build()
    .unwrap();
}

pub async fn download(url: &str, path: &str) -> Option<()> {
  let mut file = File::create_new(path).ok()?;

  let res = CLIENT.get(url).send().await.ok()?.bytes().await.ok()?;

  file.write_all(&res).ok()?;
  file.flush().ok()?;

  drop(res);
  drop(file);

  Some(())
}

#[cfg(windows)]
mod win32;

#[cfg(windows)]
pub use win32::*;

#[cfg(unix)]
mod linux;

#[cfg(unix)]
pub use win32::*;
