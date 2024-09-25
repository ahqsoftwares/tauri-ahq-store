#![allow(unused)]
#![allow(non_upper_case_globals)]

pub mod download;
pub mod extract;
#[macro_use]
pub mod utils;

mod ws;

use crate::rpc;
use tauri::{Emitter, Listener};
use tauri::menu::IconMenuItemBuilder;
use tauri::tray::{TrayIconBuilder, TrayIconEvent, MouseButton};
use tauri::window::{ProgressBarState, ProgressBarStatus};
use tauri::{AppHandle, Runtime, WebviewWindowBuilder};
use tauri::{
  image::Image,
  menu::{Menu, MenuBuilder, MenuEvent, MenuId, MenuItem},
  Manager, RunEvent,
};
//modules
use crate::encryption::{decrypt, encrypt, to_hash_uid};

//crates
#[cfg(windows)]
use windows::Win32::{
  Foundation::BOOL,
  Graphics::Dwm::{
    DwmEnableBlurBehindWindow, DwmSetWindowAttribute, DWMWINDOWATTRIBUTE, DWM_BLURBEHIND,
  },
};

use std::panic::catch_unwind;
use std::path::PathBuf;
use std::process;
use std::time::{Duration, SystemTime};

#[cfg(unix)]
use whatadistro::identify;

//std
#[cfg(windows)]
use std::os::windows::process::CommandExt;
use std::{
  fs,
  process::Command,
  process::Stdio,
  sync::{Arc, Mutex},
  thread,
};

//link Launcher
use open as open_2;

use utils::{get_service_url, is_an_admin};

macro_rules! platform_impl {
  ($x:expr, $y:expr) => {{
    #[cfg(windows)]
    return { $x };

    #[cfg(unix)]
    return { $y };
  }};
}

#[derive(Debug, Clone)]
struct AppData {
  pub name: String,
  pub data: String,
}

static mut WINDOW: Option<tauri::WebviewWindow<tauri::Wry>> = None;
static mut UPDATER_FILE: Option<String> = None;

lazy_static::lazy_static! {
  static ref ready: Arc<Mutex<bool>> = Arc::new(Mutex::new(false));
  static ref queue: Arc<Mutex<Vec<AppData>>> = Arc::new(Mutex::new(Vec::<AppData>::new()));
}

pub fn main() {
  let context = tauri::generate_context!();

  let app = tauri::Builder::default()
    .setup(|app| {
      println!(
        "Webview v{}",
        tauri::webview_version().unwrap_or("UNKNOWN".to_string())
      );
      let args = std::env::args();
      let buf = std::env::current_exe().unwrap().to_owned();
      let exec = buf.to_str().unwrap().to_owned();

      let window = app.get_webview_window("main").unwrap();

      let listener = window.clone();

      let ready_clone = ready.clone();
      let queue_clone = queue.clone();

      let mut updater_path = app.path().app_data_dir().unwrap();
      let _ = fs::create_dir_all(&updater_path);
      updater_path.push("update.txt");

      unsafe {
        UPDATER_FILE = Some(updater_path.to_str().unwrap().to_string());
        fs::remove_dir_all(format!("{}\\astore", sys_handler())).unwrap_or(());
        let window = app.get_webview_window("main").unwrap();

        WINDOW = Some(window.clone());

        ws::init(&window, || {
          #[cfg(debug_assertions)]
          println!("Reinstall of AHQ Store is required...");

          tauri::async_runtime::spawn(async {
            update_inner(true).await;
          });
        });
      }

      tauri::async_runtime::block_on(async {
        update_inner(false).await;
      });

      #[cfg(windows)]
      {
        thread::sleep(Duration::from_secs(1));
        let hwnd = window.hwnd().unwrap();

        unsafe {
          //2: Mica, 3: Acrylic, 4: Mica Alt
          let attr = 2;
          let _ = DwmSetWindowAttribute(
            hwnd,
            DWMWINDOWATTRIBUTE(38),
            &attr as *const _ as _,
            std::mem::size_of_val(&attr) as u32,
          );
        }
      }

      {
        let window = window.clone();
        listener.listen("ready", move |_| {
          #[cfg(debug_assertions)]
          println!("ready");

          *ready_clone.lock().unwrap() = true;

          for item in queue_clone.lock().unwrap().iter() {
            window.emit(item.name.as_str(), item.data.clone()).unwrap();
          }

          let lock = queue_clone.lock();

          if lock.is_ok() {
            *lock.unwrap() = Vec::<AppData>::new();
          }
        });
      }

      {
        let window = window.clone();
        listener.listen("activate", move |_| {
          window.show().unwrap();
        });
      }

      if std::env::args().last().unwrap().as_str() != exec.clone().as_str() {
        let args = args.last().unwrap_or(String::from(""));

        #[cfg(debug_assertions)]
        println!("Started with {}", args);

        if *ready.clone().lock().unwrap() {
          window.emit("launch_app", args.clone()).unwrap();
        } else {
          queue.clone().lock().unwrap().push(AppData {
            data: args.clone(),
            name: String::from("launch_app"),
          });
        }
      }

      Ok(())
    })
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_single_instance::init(|app, args, _| {
      if let Some(main) = app.get_webview_window("main") {
        let _ = main.show();
        let _ = main.set_focus();

        if args.len() == 3 {
          if *ready.clone().lock().unwrap() {
            main.emit("launch_app", args[2].clone()).unwrap();
          } else {
            queue.clone().lock().unwrap().push(AppData {
              data: args[2].clone(),
              name: String::from("launch_app"),
            });
          }
        }
      }
    }))
    .invoke_handler(tauri::generate_handler![
      get_windows,
      sys_handler,
      encrypt,
      decrypt,
      dsc_rpc,
      to_hash_uid,
      open,
      set_progress,
      is_an_admin,
      is_development,
      check_install_update,
      show_code,
      rem_code,
      hash_username,
      get_linux_distro
    ])
    .menu(|handle| Menu::new(handle))
    .build(context)
    .unwrap();

  TrayIconBuilder::with_id("main")
    .tooltip("AHQ Store is running")
    .icon(Image::from_bytes(include_bytes!("../../icons/icon.png")).unwrap())
    .menu_on_left_click(false)
    .menu(
      &MenuBuilder::new(&app)
        .id("tray-menu")
        .item(
          &IconMenuItemBuilder::new("&AHQ Store")
            .enabled(false)
            .icon(Image::from_bytes(include_bytes!("../../icons/icon.png")).unwrap())
            .build(&app)
            .unwrap(),
        )
        .separator()
        .item(&MenuItem::with_id(&app, "open", "Open App", true, None::<String>).unwrap())
        .item(
          &MenuItem::with_id(&app, "update", "Check for Updates", true, None::<String>).unwrap(),
        )
        .separator()
        .item(&MenuItem::with_id(&app, "quit", "Quit", true, None::<String>).unwrap())
        .build()
        .unwrap(),
    )
    .on_tray_icon_event(|app, event| match event {
      TrayIconEvent::Click { button, .. } => match button {
        MouseButton::Left => {
          let _ = app.app_handle().get_webview_window("main").unwrap().show();
        }
        _ => {}
      }
      _ => {}
    })
    .on_menu_event(|app, ev| {
      let MenuEvent { id: MenuId(id) } = ev;

      match id.as_str() {
        "open" => {
          let window = app.get_webview_window("main").unwrap();
          window.show().unwrap();
        }
        "update" => {
          tauri::async_runtime::spawn(async {
            check_install_update().await;
          });
        }
        "quit" => {
          process::exit(0);
        }
        _ => {}
      }
    })
    .build(&app)
    .unwrap();

  app.run(move |app, event| match event {
    RunEvent::ExitRequested { api, .. } => {
      api.prevent_exit();
    }
    RunEvent::WindowEvent { event, label, .. } => match event {
      tauri::WindowEvent::CloseRequested { api, .. } => {
        api.prevent_close();

        if let Some(win) = app.get_webview_window(&label) {
          let _ = win.hide();
        }
      }
      _ => {}
    },
    _ => {}
  });
}

#[tauri::command(async)]
fn hash_username(username: String) -> String {
  ahqstore_gh_hash::compute(username.as_str())
}

#[tauri::command(async)]
fn dsc_rpc(window: tauri::WebviewWindow<tauri::Wry>,) {
  rpc::init_presence(&window);
}

#[tauri::command(async)]
fn show_code<R: Runtime>(app: AppHandle<R>, code: String) {
  WebviewWindowBuilder::new(&app, "code", tauri::WebviewUrl::App(PathBuf::from(&format!("/{code}"))))
    .skip_taskbar(true)
    .title("Login to GitHub")
    .inner_size(400.0, 150.0)
    .max_inner_size(400.0, 150.0)
    .min_inner_size(400.0, 150.0)
    .decorations(false)
    .always_on_top(true)
    .fullscreen(false)
    .content_protected(true)
    .maximizable(false)
    .minimizable(false)
    .closable(true)
    .focused(true)
    .build();
}

#[tauri::command(async)]
fn rem_code<R: Runtime>(app: tauri::AppHandle<R>) {
  app.get_webview_window("code")
    .unwrap()
    .destroy()
    .unwrap()
}

#[tauri::command(async)]
fn is_development() -> bool {
  cfg!(debug_assertions) || env!("CARGO_PKG_VERSION").contains("-alpha")
}

#[cfg(unix)]
pub fn chmod(typ: &str, regex: &str) -> Option<bool> {
  use std::process::Command;

  Command::new("chmod")
    .args([typ, regex])
    .spawn()
    .ok()?
    .wait()
    .ok()?
    .success()
    .into()
}

#[tauri::command(async)]
fn open(url: String) -> Option<()> {
  match open_2::that(url) {
    Ok(_) => Some(()),
    _ => None,
  }
}

#[tauri::command]
async fn check_install_update() {
  update_inner(false).await;
}

async fn now() -> u64 {
  use std::time::UNIX_EPOCH;

  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap()
    .as_secs()
}

async fn update_inner(must: bool) {
  use updater::*;
  let now = now().await;

  if !must {
    if let Some(x) = unsafe { UPDATER_FILE.as_ref() } {
      if let Ok(mut x) = fs::read(x) {
        let mut bytes = [0; 8];

        x.truncate(8);

        if x.len() == 8 {
          for (i, d) in x.iter().enumerate() {
            bytes[i] = *d;
          }

          let should = u64::from_be_bytes(bytes) + (/*1 day*/ 60 * 60 * 24);

          if now < should {
            return;
          }
        }
      }
    }
  }

  let (avail, release) = is_update_available(
    if must { 
      ""
     } else { env!("CARGO_PKG_VERSION") },
    env!("CARGO_PKG_VERSION").contains("-alpha"),
  )
  .await;

  if avail {
    if let Some(release) = release {
      unsafe {
        let _ = WINDOW.clone().unwrap().emit("update", "installing");
      }
      let _ = fs::write(unsafe { UPDATER_FILE.as_ref().unwrap() }, now.to_be_bytes());
      tokio::time::sleep(Duration::from_secs(4)).await;
      update(release).await;
      process::exit(0);
    }
  }
}

#[tauri::command(async)]
fn sys_handler() -> String {
  #[cfg(windows)]
  return std::env::var("SYSTEMROOT")
    .unwrap()
    .to_uppercase()
    .as_str()
    .replace("\\WINDOWS", "")
    .replace("\\Windows", "");

  #[cfg(unix)]
  return "/".into();
}

#[tauri::command(async)]
fn set_progress(
  window: tauri::WebviewWindow<tauri::Wry>,
  state: i32,
  c: Option<u64>,
  t: Option<u64>,
) {
  let progress = match (c, t) {
    (Some(c), Some(t)) => Some((c * 100) / t),
    _ => None,
  };
  let _ = window.set_progress_bar(ProgressBarState {
    progress,
    status: Some(match state {
      0x00000001 => ProgressBarStatus::Indeterminate,
      0x00000002 => ProgressBarStatus::Normal,
      0x00000004 => ProgressBarStatus::Error,
      0x00000008 => ProgressBarStatus::Paused,
      _ => ProgressBarStatus::None,
    }),
  });
}

#[tauri::command(async)]
fn get_linux_distro() -> Option<String> {
  #[cfg(windows)]
  return None;

  #[cfg(unix)]
  return Some(identify()?.name().into());
}

#[tauri::command(async)]
fn get_windows() -> &'static str {
  #[cfg(unix)]
  return "linux";

  #[cfg(windows)]
  return {
    if is_windows_11() {
      "11"
    } else {
      "10"
    }
  };
}

#[cfg(windows)]
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
