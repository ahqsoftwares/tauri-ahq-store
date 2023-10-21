#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod download;
pub mod encryption;
pub mod extract;
pub mod util;

mod rpc;

mod ws;

//utilities
#[cfg(not(debug_assertions))]
use base64::{self, Engine};
#[cfg(not(debug_assertions))]
use minisign_verify::{Error, PublicKey, Signature};

//modules
use encryption::{decrypt, encrypt};

//crates
use window_vibrancy::apply_mica;
use windows::Win32::{
  System::Com::{CoCreateInstance, CLSCTX_SERVER},
  UI::Shell::{ITaskbarList4, TaskbarList, TBPFLAG},
};

use std::env::current_exe;
use std::panic::catch_unwind;
use std::time::Duration;
//std
use os_version::Windows;
use std::os::windows::process::CommandExt;
use std::{
  fs,
  process::Command,
  process::{exit, Stdio},
  sync::{Arc, Mutex},
  thread,
};

//tauri
use tauri::{CustomMenuItem, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu};

//link Launcher
use open as open_2;

use crate::util::{get_service_url, is_an_admin};

#[derive(Debug, Clone)]
struct AppData {
  pub name: String,
  pub data: String,
}

static mut WINDOW: Option<tauri::Window<tauri::Wry>> = None;

fn main() {
  tauri_plugin_deep_link::prepare("com.ahqsoftwares.store");

  let context = tauri::generate_context!();

  let app = tauri::Builder::default()
    .setup(|app| {
      let args = std::env::args();
      let buf = std::env::current_exe().unwrap().to_owned();
      let exec = buf.to_str().unwrap().to_owned();

      let ready = Arc::new(Mutex::new(false));
      let queue = Arc::new(Mutex::new(Vec::<AppData>::new()));

      let window = tauri::Manager::get_window(app, "complement").unwrap();

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
        let _ = apply_mica(&window, None);
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

      let window = window.clone();
      tauri_plugin_deep_link::register("ahqstore", move |request| {
        #[cfg(debug_assertions)]
        println!("{:?}", request);
        window.emit("app", request).unwrap_or(());
      })
      .unwrap();

      Ok(())
    })
    .system_tray(
      SystemTray::new()
        .with_tooltip("AHQ Store is running")
        .with_menu(
          SystemTrayMenu::new().add_item(CustomMenuItem::new("quit".to_string(), "Close App")),
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
      check_update,
      install_update,
      encrypt,
      decrypt,
      open,
      set_progress,
      is_an_admin,
      is_development
    ])
    .menu(if cfg!(target_os = "macos") {
      tauri::Menu::os_default(&context.package_info().name)
    } else {
      tauri::Menu::default()
    })
    .build(context)
    .unwrap();

  let window = tauri::Manager::get_window(&app, "main").unwrap();

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
  let complement = tauri::Manager::get_window(&app, "complement").unwrap();

  app.run(move |_, event| match event {
    RunEvent::ExitRequested { api, .. } => {
      api.prevent_exit();
    }
    RunEvent::WindowEvent { event, label, .. } => match event {
      tauri::WindowEvent::CloseRequested { api, .. } => {
        api.prevent_close();
        if &label == "complement" {
          complement.hide().unwrap();
        } else {
          complement.hide().unwrap();
          main.hide().unwrap();
        }
      }
      _ => {}
    },
    _ => {}
  });
}

#[cfg(not(debug_assertions))]
fn base64_to_string(base64_string: &str) -> Option<String> {
  let base64decoder = base64::engine::general_purpose::STANDARD;
  let decoded_string = base64decoder.decode(base64_string).unwrap_or(vec![]);

  let result = String::from_utf8(decoded_string).unwrap_or("".to_string());
  Some(result)
}

const UPDATER_PATH: &str = "%root%\\A_STORE_CACHE";

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

#[tauri::command(async)]
#[cfg(debug_assertions)]
fn check_update(
  version: String,
  current_version: String,
  download_url: String,
  signature: String,
) -> bool {
  drop(version);
  drop(current_version);
  drop(download_url);
  drop(signature);
  return false;
}

#[tauri::command(async)]
#[cfg(not(debug_assertions))]
fn check_update(
  version: String,
  current_version: String,
  download_url: String,
  signature: String,
) -> bool {
  fs::remove_dir_all(UPDATER_PATH.replace("%root%", &sys_handler())).unwrap_or(());

  let mut update_available = &version != &current_version;

  if update_available {
    let sys_dir = sys_handler();

    let path = UPDATER_PATH.replace("%root%", sys_dir.as_str());

    fs::remove_file(format!("{}\\updater.zip", path.clone())).unwrap_or(());

    let path2 = path.clone();
    thread::spawn(move || {
      download::download(
        download_url.as_str(),
        path2.as_str(),
        "updater.zip",
        |_, _| {},
      );
    })
    .join()
    .unwrap();

    let data = std::fs::read(format!("{}\\updater.zip", path.clone())).unwrap_or(vec![]);

    update_available = verify_signature(data, signature.as_str()).unwrap_or(false);
  }

  update_available
}

#[cfg(not(debug_assertions))]
fn verify_signature(data: Vec<u8>, release_signature: &str) -> Result<bool, Error> {
  let pub_key = base64_to_string("dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDlCNUQyRTdGQUVFN0FDQTQKUldTa3JPZXVmeTVkbTBUL0JjSnNjLytQOHlyYkRnakJ2Q3dnYW51WTJIRVVCL1psWFNLT0pLSkgK").unwrap_or("".to_string());
  let key_verifier = PublicKey::decode(&pub_key)?;

  let signature_decoded = base64_to_string(release_signature).unwrap_or("".to_string());
  let signature = Signature::decode(&signature_decoded)?;

  key_verifier.verify(&data, &signature, true)?;
  Ok(true)
}

#[tauri::command(async)]
fn install_update() {
  let sys_dir = sys_handler();
  let path = UPDATER_PATH.replace("%root%", sys_dir.as_str());

  Command::new("powershell")
    .creation_flags(0x08000000)
    .args([
      "Expand-Archive",
      format!("-Path \"{}\\updater.zip\"", path.clone()).as_str(),
      format!("-DestinationPath \"{}\"", path.clone()).as_str(),
      "-Force",
    ])
    .spawn()
    .unwrap()
    .wait()
    .unwrap();

  let files = std::fs::read_dir(path.clone()).unwrap();

  let mut app_executable = String::new();
  for file in files {
    let name = file.unwrap().file_name();
    let file_name = name.to_str().unwrap_or("");

    if file_name.clone().ends_with(".msi") {
      app_executable = format!("\"{}\\{}\"", path.clone(), file_name);
    }
  }

  let mut current_exe_arg = std::ffi::OsString::new();
  current_exe_arg.push("\"");
  current_exe_arg.push(current_exe().unwrap());
  current_exe_arg.push("\"");

  Command::new("powershell")
    .creation_flags(0x08000000)
    .args(["Start-Process", "-Wait"])
    .arg(app_executable)
    .arg("/qb+; start-process")
    .arg(current_exe_arg)
    .spawn()
    .unwrap();

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

pub fn get_system_dir() -> String {
  sys_handler()
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
fn get_windows() -> Option<String> {
  match Windows::detect() {
    Ok(win) => {
      if win.version == String::from("10") {
        Some(if is_windows_11() {
          11.to_string()
        } else {
          10.to_string()
        })
      } else {
        Some(win.version)
      }
    }
    Err(_) => None,
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
