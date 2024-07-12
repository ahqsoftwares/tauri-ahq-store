use crate::utils::*;
use sysinfo::{Pid, System, Users};

pub fn authenticate_process(pid: usize, time: bool) -> (bool, bool) {
  #[cfg(all(not(debug_assertions), windows))]
  let exe = [format!(
    r"{}\Program Files\AHQ Store\AHQ Store.exe",
    get_main_drive()
  )];

  #[cfg(all(not(debug_assertions), unix))]
  let exe = [format!("/bin/ahq-store",), format!("/usr/bin/ahq-store")];

  #[cfg(all(debug_assertions, windows))]
  let exe = [format!(
    r"E:\GitHub\ahq-store-tauri\src-tauri\target\debug\AHQ Store.exe"
  )];

  #[cfg(all(debug_assertions, unix))]
  let exe = [
    format!(
      "/media/ahqsoftwares/AHQ_s Drive/GitHub/ahq-store-tauri/src-tauri/target/debug/ahq-store"
    ),
    format!("/media/ahqsoftwares/AHQ_s Drive/rust/server/target/debug/server"),
  ];
  //let path = format!(r"E:\rust\iprocess\target\debug\iprocess.exe");

  let mut system = System::new();
  let mut users = Users::new();
  users.refresh_list();
  system.refresh_all();

  let process = system.process(Pid::from(pid));

  if let Some(process) = process {
    let admin = (|| {
      if !time {
        return None;
      }
      Some(users.get_user_by_id(process.user_id()?)?.groups().iter().find(|x| x.name() == "Administrators").is_some())
    })().unwrap_or(false);

    let Some(ex) = process.exe() else {
      return (false, false);
    };
    let exe_path = ex.to_string_lossy();
    let exe_path = exe_path.to_string();

    #[cfg(feature = "no_auth")]
    return (true, admin);

    let running_for_secs = now() - process.start_time();

    write_log(format!(
      "{:?} {} {} {}",
      &exe,
      &exe_path,
      &running_for_secs,
      exe.contains(&exe_path)
    ));

    if exe.contains(&exe_path) {
      if time && running_for_secs > 20 {
        return (false, admin);
      }
      return (true, admin);
    }
  }

  (false, false)
}
