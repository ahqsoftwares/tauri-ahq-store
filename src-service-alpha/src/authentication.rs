use std::time::{UNIX_EPOCH, SystemTime};

use sysinfo::{System, SystemExt, ProcessExt};

#[cfg_attr(debug_assertions, allow(dead_code))]
pub fn is_process_running<T>(exe: T) -> bool
    where
        T: Into<String>
{
    let exe: String = exe.into();

    let system = System::new_all();

    let processes = system.processes();

    for (_, process) in processes {
        let exe_path = process.exe().as_os_str().to_str().map_or_else(|| "", |x| x);

        let start_time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() - process.start_time();

        if exe_path == &exe && start_time < 120 {
            println!("{} secs before now", start_time);
            println!("{} Matched", &exe_path);
            return true;
        }
    }

    false
}

#[cfg_attr(debug_assertions, allow(dead_code))]
pub fn get_main_drive() -> String {
    std::env::var("SystemDrive").unwrap_or("C:".into()).to_string()
}