pub mod download;
pub mod extract;
#[macro_use]
pub mod utils;

mod ws;

use crate::rpc;

//modules
use crate::encryption::{decrypt, encrypt};

//crates
use windows::{core::PCWSTR, Win32::{
  Graphics::Dwm::{DwmSetWindowAttribute, DWMWINDOWATTRIBUTE}, System::Com::{CoCreateInstance, CLSCTX_SERVER}, UI::{Shell::{ITaskbarList4, TaskbarList, TBPFLAG}, WindowsAndMessaging::HICON}
}};

use std::panic::catch_unwind;
use std::time::Duration;
//std
use std::os::windows::process::CommandExt;
use std::{
  fs,
  process::Command,
  process::{exit, Stdio},
  sync::{Arc, Mutex},
  thread,
};

//tauri
use tauri::{
  CustomMenuItem, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

//link Launcher
use open as open_2;

use utils::{get_service_url, is_an_admin};

#[derive(Debug, Clone)]
struct AppData {
  pub name: String,
  pub data: String,
}

static mut WINDOW: Option<tauri::Window<tauri::Wry>> = None;

pub fn main() {
  let context = tauri::generate_context!();

  let app = tauri::Builder::default()
    .setup(|app| {
      let args = std::env::args();
      let buf = std::env::current_exe().unwrap().to_owned();
      let exec = buf.to_str().unwrap().to_owned();

      let ready = Arc::new(Mutex::new(false));
      let queue = Arc::new(Mutex::new(Vec::<AppData>::new()));

      let window = tauri::Manager::get_window(app, "main").unwrap();

      let listener = window.clone();

      let ready_clone = ready.clone();
      let queue_clone = queue.clone();
      let window_clone = window.clone();
      let window_clone_2 = tauri::Manager::get_window(app, "main").unwrap();

      unsafe {
        fs::remove_dir_all(format!("{}\\astore", sys_handler())).unwrap_or(());
        let window = tauri::Manager::get_window(app, "main").unwrap();

        WINDOW = Some(window.clone());

        ws::init(window, || {
          #[cfg(debug_assertions)]
          println!("Reinstall AHQ Store Service Required...");

          if catch_unwind(|| {
            let mut i = 0;

            loop {
              WINDOW
                .as_mut()
                .unwrap()
                .emit("needs_reinstall", "None")
                .unwrap();
              thread::sleep(Duration::from_secs(1));
              i += 1;

              if i >= 10 {
                break;
              }
            }

            let url = get_service_url();

            let sys = sys_handler();

            fs::create_dir_all(format!("{}\\astore", sys)).unwrap();
            download::download(
              &url,
              &format!("{}\\astore", sys),
              "astore_service_installer.exe",
              |_c, _t| {
                #[cfg(debug_assertions)]
                println!("{}", _c * 100 / _t);
              },
            );

            extract::run_admin(format!("{}\\astore\\astore_service_installer.exe", sys));
          })
          .is_err()
          {
            std::process::exit(1);
          } else {
            std::process::exit(0);
          }
        });
      }

      {
        let window = window_clone_2.clone();

        rpc::init_presence(window);
      }

      {
        thread::sleep(Duration::from_secs(1));
        let hwnd = window_clone_2.hwnd().unwrap();
        
        unsafe {
          //2: Mica, 3: Acrylic, 4: Mica Alt
          let attr = 2;
          let _ = DwmSetWindowAttribute(hwnd, DWMWINDOWATTRIBUTE(38), &attr as *const _ as _, std::mem::size_of_val(&attr) as u32);
        }
      }

      listener.listen("ready", move |_| {
        #[cfg(debug_assertions)]
        println!("ready");

        *ready_clone.lock().unwrap() = true;

        for item in queue_clone.lock().unwrap().iter() {
          window_clone
            .emit(item.name.as_str(), item.data.clone())
            .unwrap();
        }

        let lock = queue_clone.lock();

        if lock.is_ok() {
          *lock.unwrap() = Vec::<AppData>::new();
        }
      });

      listener.listen("activate", move |_| {
        window_clone_2.show().unwrap();
      });

      if std::env::args().last().unwrap().as_str() != exec.clone().as_str() {
        let args = args.last().unwrap_or(String::from(""));

        #[cfg(debug_assertions)]
        println!("Started with {}", args);

        if *ready.clone().lock().unwrap() {
          window.emit("app", args.clone()).unwrap();
        } else {
          queue.clone().lock().unwrap().push(AppData {
            data: args.clone(),
            name: String::from("app"),
          });
        }
      }

      Ok(())
    })
    .system_tray(
      SystemTray::new()
        .with_tooltip("AHQ Store is running")
        .with_menu(
          SystemTrayMenu::new()
            .add_item(CustomMenuItem::new("0", "AHQ Store").disabled())
            .add_native_item(SystemTrayMenuItem::Separator)
            .add_item(CustomMenuItem::new("open", "Open Store"))
            .add_item(CustomMenuItem::new("update", "Check for Updates..."))
            .add_native_item(SystemTrayMenuItem::Separator)
            .add_item(CustomMenuItem::new("quit", "Quit")),
        ),
    )
    .plugin(tauri_plugin_single_instance::init(|app, _, _| {
      let main = tauri::Manager::get_window(app, "main").unwrap();

      main.show().unwrap();
      main.set_focus().unwrap();
    }))
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::LeftClick { .. } => {
        #[cfg(debug_assertions)]
        println!("Received a left Click");
        let main = tauri::Manager::get_window(app, "main").unwrap();

        main.show().unwrap();
        main.set_focus().unwrap();
      }
      SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
        "quit" => std::process::exit(0),
        _ => {}
      },
      _ => {}
    })
    .invoke_handler(tauri::generate_handler![
      get_windows,
      sys_handler,
      install_update,
      encrypt,
      decrypt,
      open,
      set_progress,
      is_an_admin,
      is_development,
      set_overlay
    ])
    .menu(if cfg!(target_os = "macos") {
      tauri::Menu::os_default(&context.package_info().name)
    } else {
      tauri::Menu::default()
    })
    .build(context)
    .unwrap();

  let window = tauri::Manager::get_window(&app, "main").unwrap();

  unsafe {
    let hwnd = window.clone().hwnd().unwrap();

    let taskbar: ITaskbarList4 = CoCreateInstance(&TaskbarList, None, CLSCTX_SERVER).unwrap();

    let icon = HICON(32518);
    
    taskbar.SetOverlayIcon(hwnd, icon, PCWSTR::from_raw("Test" as *const _ as _)).unwrap();
  }

  {
    let window = window.clone();
    let window2 = window.clone();

    window.listen("sendUpdaterStatus", move |event| {
      window2
        .emit("sendUpdaterStatus", event.payload().unwrap())
        .unwrap();
    });
  }

  let main = window.clone();

  app.run(move |_, event| match event {
    RunEvent::ExitRequested { api, .. } => {
      api.prevent_exit();
    }
    RunEvent::WindowEvent { event, label, .. } => match event {
      tauri::WindowEvent::CloseRequested { api, .. } => {
        api.prevent_close();
        main.hide().unwrap();
      }
      _ => {}
    },
    _ => {}
  });
}

#[tauri::command(async)]
fn is_development() -> bool {
  cfg!(debug_assertions)
}

#[tauri::command(async)]
fn open(url: String) -> Option<()> {
  match open_2::that(url) {
    Ok(_) => Some(()),
    _ => None,
  }
}

// #[tauri::command(async)]
// #[cfg(debug_assertions)]
// fn check_update(
//   version: String,
//   current_version: String,
//   download_url: String,
//   signature: String,
// ) -> bool {
//   drop(version);
//   drop(current_version);
//   drop(download_url);
//   drop(signature);
//   return false;
// }

// #[tauri::command(async)]
// #[cfg(not(debug_assertions))]
// fn check_update(
//   version: String,
//   current_version: String,
//   download_url: String,
//   signature: String,
// ) -> bool {
//   fs::remove_dir_all(UPDATER_PATH.replace("%root%", &sys_handler())).unwrap_or(());

//   let mut update_available = &version != &current_version;

//   if update_available {
//     let sys_dir = sys_handler();

//     let path = UPDATER_PATH.replace("%root%", sys_dir.as_str());

//     fs::remove_file(format!("{}\\updater.zip", path.clone())).unwrap_or(());

//     let path2 = path.clone();
//     thread::spawn(move || {
//       download::download(
//         download_url.as_str(),
//         path2.as_str(),
//         "updater.zip",
//         |_, _| {},
//       );
//     })
//     .join()
//     .unwrap();

//     let data = std::fs::read(format!("{}\\updater.zip", path.clone())).unwrap_or(vec![]);

//     update_available = verify_signature(data, signature.as_str()).unwrap_or(false);
//   }

//   update_available
// }

#[tauri::command(async)]
fn install_update() {
  exit(0);
}

#[tauri::command(async)]
fn sys_handler() -> String {
  std::env::var("SYSTEMROOT")
    .unwrap()
    .to_uppercase()
    .as_str()
    .replace("\\WINDOWS", "")
    .replace("\\Windows", "")
}

#[tauri::command(async)]
fn set_overlay(set: bool) {
  println!("Called {}", &set);
  unsafe {
    let hwnd = WINDOW.clone().unwrap().hwnd().unwrap();

    let taskbar: ITaskbarList4 = CoCreateInstance(&TaskbarList, None, CLSCTX_SERVER).unwrap();

    let icon = HICON(32518);
    
    taskbar.SetOverlayIcon(hwnd, icon, PCWSTR::from_raw("Test" as *const _ as _)).unwrap();
  }
}

#[tauri::command(async)]
fn set_progress(state: i32, c: Option<u64>, t: Option<u64>) {
  unsafe {
    let handle = WINDOW.clone().unwrap().hwnd().unwrap();

    let taskbar: ITaskbarList4 = CoCreateInstance(&TaskbarList, None, CLSCTX_SERVER).unwrap();

    taskbar
      .SetProgressState::<windows::Win32::Foundation::HWND>(handle, TBPFLAG(state))
      .unwrap();

    if let Some(c) = c {
      if let Some(t) = t {
        taskbar
          .SetProgressValue::<windows::Win32::Foundation::HWND>(handle, c, t)
          .unwrap();
      }
    }
  }
}

#[tauri::command(async)]
fn get_windows() -> &'static str {
  if is_windows_11() {
    "11"
  } else {
    "10"
  }
}

fn is_windows_11() -> bool {
  let version = Command::new("cmd")
    .creation_flags(0x08000000)
    .args(["/c", "ver"])
    .stdout(Stdio::piped())
    .spawn()
    .unwrap()
    .wait_with_output()
    .unwrap()
    .stdout;

  let string = String::from_utf8(version).unwrap();
  let splitted = string
    .replace("\n", "")
    .replace("Microsoft Windows [", "")
    .replace("]", "");
  let version: Vec<&str> = splitted.split(".").collect();

  let version: usize = version[2].parse().unwrap_or(0);

  version >= 22000
}
