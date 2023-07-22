use std::{os::windows::process::CommandExt, process::Command};

pub fn launch(args: &[&str], custom_path: Option<String>) {
    Command::new(custom_path.unwrap_or("powershell".to_string()))
        .creation_flags(0x08000000)
        .args(["-NoProfile", "-WindowStyle", "Minimized"])
        .args(args)
        .spawn()
        .unwrap()
        .wait()
        .unwrap();
}
