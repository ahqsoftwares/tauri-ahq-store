#[cfg(windows)]
use {
  std::{env, io},
  winres::WindowsResource,
};

#[cfg(not(windows))]
use std::io;

fn main() -> io::Result<()> {
  #[cfg(windows)]
  if env::var_os("CARGO_CFG_WINDOWS").is_some() {
    WindowsResource::new()
      .set_icon("src/icon.ico")
      .compile()?;
  }
  Ok(())
}