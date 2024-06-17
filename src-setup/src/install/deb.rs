use crate::utils::get_service_dir;
use std::{
  io::Write,
  process::{Child, Command, Stdio},
};

pub fn get_sudo() -> Child {
  let child = Command::new("pkexec")
    .args(["sudo", "-i"])
    .stdin(Stdio::piped())
    .spawn()
    .unwrap();

  child
}

pub fn install_deb(child: &mut Child, path: &str) {
  let stdin = child.stdin.as_mut();
  let stdin = stdin.unwrap();

  let data = format!("dpkg -i {:?}\n", &path);

  let _ = stdin.write_all(data.as_bytes());
}

pub fn install_daemon(child: &mut Child, service: String) {
  let stdin = child.stdin.as_mut();
  let stdin = stdin.unwrap();

  let perma_service = get_service_dir();

  let data = format!(
    "cp {} {}\nrm {}\nchmod -R u+rwx /ahqstore\n",
    &service, &perma_service, &service
  );
  let _ = stdin.write_all(data.as_bytes());

  let file = format!(
    r"[Unit]
Description=AHQ Store Service
    
[Service]
User=root
WorkingDirectory=/ahqstore
ExecStart=/ahqstore/service
Restart=always
    
[Install]
WantedBy=multi-user.target"
  );

  let data = format!("echo {file:?} > /etc/systemd/system/ahqstore.service\nsystemctl daemon-reload\nsystemctl enable ahqstore.service\nsystemctl start ahqstore.service\n");
  let _ = stdin.write_all(data.as_bytes());
}

pub fn exit(mut child: Child) {
  let stdin = child.stdin.as_mut();
  let stdin = stdin.unwrap();
  let _ = stdin.write_all(b"exit\n");
  let _ = stdin.flush();

  let _ = child.wait();
}
