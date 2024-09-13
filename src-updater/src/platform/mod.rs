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
  println!("{}", &path);

  let mut file = File::create(path).ok()?;

  let res = CLIENT.get(url).send().await.ok()?.bytes().await.ok()?;

  file.write_all(&res).ok()?;
  file.flush().ok()?;

  drop(res);
  drop(file);

  Some(())
}

#[cfg(windows)]
mod windows;

#[cfg(windows)]
pub use windows::*;

#[cfg(unix)]
mod linux;

#[cfg(unix)]
pub use linux::*;
