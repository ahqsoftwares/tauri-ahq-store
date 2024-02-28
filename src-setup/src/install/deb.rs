use std::{io::Write, process::{Child, Command, Stdio}};

pub fn get_sudo() -> Child {
    Command::new("pkexec")
        .args(["sudo", "-i"])
        .stdin(Stdio::piped())
        .spawn()
        .unwrap()
}

pub fn install_deb(child: &mut Child, path: &str) {
    let stdin = child.stdin.as_mut();
    let stdin= stdin.unwrap();

    let data = format!("dpkg -i {:?}\n", &path);

    let _ = stdin.write_all(data.as_bytes());
}

pub fn exit(mut child: Child) {
    let stdin = child.stdin.as_mut();
    let stdin = stdin.unwrap();
    let _ = stdin.write_all(b"exit\n");
    let _ = stdin.flush();

    let _ = child.wait();
}