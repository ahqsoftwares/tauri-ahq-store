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