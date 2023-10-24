use crate::windows::utils::*;
use sysinfo::{Pid, ProcessExt, System, SystemExt};

pub fn authenticate_process(pid: usize) -> bool {
  #[cfg(not(debug_assertions))]
  let path = format!(
    r"{}\Program Files\AHQ Store\AHQ Store.exe",
    get_main_drive()
  );

  #[cfg(debug_assertions)]
  let path = format!(r"E:\GitHub\ahq-store-tauri\src-tauri\target\debug\AHQ Store.exe");

  let path = path.as_bytes();
  let exe = String::from_utf8_lossy(path);

  let mut system = System::new_all();
  system.refresh_all();

  let process = system.process(Pid::from(pid));

  if let Some(process) = process {
    let exe_path = process.exe().as_os_str().to_string_lossy();

    let running_for_secs = now() - process.start_time();

    write_log(format!("{} {} {}", &exe, &exe_path, &running_for_secs));

    if exe_path == exe && running_for_secs < 20 {
      return true;
    }
  }

  false
}
