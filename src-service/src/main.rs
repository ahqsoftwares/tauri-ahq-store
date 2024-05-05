#[cfg(windows)]
#[macro_use]
mod windows;

#[cfg(windows)]
use windows::main as m_main;

fn main() {
  #[cfg(windows)]
  m_main().unwrap();

  #[cfg(unix)]
  println!("This executable will not run in linux!");
}
