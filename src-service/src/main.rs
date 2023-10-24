#[cfg(windows)]
#[macro_use]
mod windows;

#[cfg(target_os = "linux")]
#[macro_use]
mod linux;

#[cfg(target_os = "linux")]
use linux::main as m_main;

#[cfg(windows)]
use windows::main as m_main;

fn main() {
  m_main().unwrap();
}
