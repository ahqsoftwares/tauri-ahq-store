use std::env::current_exe;
use std::os::windows::process::CommandExt;
use std::{path::Path, process::Command};

pub fn extract(path: &Path, location: &Path) -> i32 {
    let args: (&Path, &Path) = (path, location);
    print!("{} {}", args.0.to_string_lossy(), args.1.to_string_lossy());

    match Command::new("powershell")
        .creation_flags(0x08000000)
        .args(["-NoProfile", "-WindowStyle", "Minimized"])
        .args([
            "Expand-Archive",
            format!("-Path \"{}\"", args.0.to_string_lossy()).as_str(),
            format!("-DestinationPath \"{}\"", args.1.to_string_lossy()).as_str(),
            "-Force",
        ])
        .spawn()
    {
        Ok(mut child) => match child.wait() {
            Ok(status) => {
                if !status.success() {
                    return 1;
                }
            }
            _ => return 1,
        },
        _ => return 1,
    }

    return 0;
}

pub fn run_admin(path: String) {
    let mut child = Command::new("powershell");

    let exe = current_exe().unwrap();

    child
        .creation_flags(0x08000000)
        .arg("start-process")
        .arg(path)
        .args(["-verb", "runas"])
        .arg("-wait; start-process")
        .arg(exe);

    let _ = child.spawn().unwrap();
}
