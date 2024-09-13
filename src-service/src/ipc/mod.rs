#[cfg(windows)]
mod win32;

#[cfg(windows)]
pub use win32::launch;

#[cfg(unix)]
mod linux;

#[cfg(unix)]
pub use linux::launch;
