use std::{
  io::Write,
  process::{Command, Stdio},
};

pub fn install_package(deb: String) -> Option<()> {
  let mut cmd = Command::new("pkexec")
    .args(["sudo", "-i"])
    .stdin(Stdio::piped())
    .spawn()
    .ok()?;

  let apt = format!("apt install {}\n", &deb);

  let service_file = format!("{:?}", include_str!("./service"));

  let commands = vec![
        apt.as_bytes(),
        b"mkdir -p /ahqstore\n",
        b"chmod 700 /ahqstore\n",
        b"cd /lib/systemd/system\n",
        b"touch ahqstore.service\n",
        b"echo ",
        service_file.as_bytes(),
        b" > ahqstore.service\n",
        b"systemctl daemon-reload; systemctl enable ahqstore; systemctl start ahqstore; systemctl status ahqstore;",
        b"exit\n"
    ];

  if let Some(ref mut std) = cmd.stdin {
    for cmd in commands {
      std.write_all(cmd).ok()?;
    }
  }

  cmd.wait().ok()?;
  Some(())
}
