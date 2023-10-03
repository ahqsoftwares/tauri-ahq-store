#[cfg(not(debug_assertions))]
use sysinfo::{Pid, ProcessExt, System, SystemExt};

#[cfg(not(debug_assertions))]
use crate::utils::*;

#[cfg_attr(debug_assertions, allow(dead_code))]
pub fn authenticate_process(pid: usize) -> bool {
  #[cfg(not(debug_assertions))]
  {
    let exe = String::from_utf8_lossy(
      format!(
        "{}\\Program Files\\AHQ Store\\AHQ Store.exe",
        get_main_drive()
      )
      .as_bytes(),
    );

    let mut system = System::new_all();
    system.refresh_all();

    let process = system.process(Pid::from(pid));

    if let Some(process) = process {
      let exe_path = process.exe().as_os_str().to_string_lossy();

      let running_for_secs = now() - process.start_time();

      if exe_path == exe && running_for_secs < 2 {
        return true;
      }
    }

    false
  }

  #[cfg(debug_assertions)]
  {
    let _ = pid;
    true
  }
}
