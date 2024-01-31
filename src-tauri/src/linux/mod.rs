use std::process;

use tauri::api::dialog::{MessageDialogBuilder, MessageDialogButtons, MessageDialogKind};
use tauri::api::notification::Notification;
use tauri::{AppHandle, Manager, RunEvent, SystemTrayEvent, WindowEvent};
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem};

use crate::rpc;
use open as open_2;

use crate::encryption::{decrypt, encrypt};

use whatadistro::identify;

mod mock_ws;

pub fn main() {
  let context = tauri::generate_context!();

  let tray_menu = SystemTrayMenu::new()
    .add_item(CustomMenuItem::new("10", "AHQ Store").disabled())
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(CustomMenuItem::new("win_show", "Open Store"))
    .add_item(CustomMenuItem::new("update", "Check for Updates..."))
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(CustomMenuItem::new("close", "Quit"));

  let system_tray = SystemTray::new().with_menu(tray_menu);

  let app = tauri::Builder::default()
    .setup(|app| {
      let win = app.get_window("main").unwrap();

      #[cfg(debug_assertions)]
      win.open_devtools();

      rpc::init_presence(win.clone());

      println!("Starting Mock WS");
      mock_ws::init(win);

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      sys_handler,
      decrypt,
      encrypt,
      is_an_admin,
      get_windows,
      get_linux_distro,
      check_update,
      is_development,
      set_progress,
      open
    ])
    .plugin(tauri_plugin_single_instance::init(|app, _, _| {
      let main = Manager::get_window(app, "main").unwrap();

      main.show().unwrap();
      main.set_focus().unwrap();
    }))
    .system_tray(system_tray)
    .on_system_tray_event(|handle, event| match event {
      SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
        "win_show" => {
          if let Some(window) = handle.get_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
            let _ = window.maximize();
          }
        }
        "close" => {
          close_app(&handle);
        }
        "update" => {
          let _ = Notification::new(&handle.config().tauri.bundle.identifier)
            .title("Updater")
            .body("Updater is under development")
            .icon("dialog-information")
            .show();
        }
        _ => {}
      },
      _ => {}
    })
    .build(context)
    .unwrap();

  app.run(move |app, event| match event {
    RunEvent::ExitRequested { api, .. } => {
      api.prevent_exit();
      close_app(&app);
    }
    RunEvent::WindowEvent { label, event, .. } => match event {
      WindowEvent::CloseRequested { api, .. } => {
        api.prevent_close();
        if &label == "main" {
          if let Some(win) = app.get_window(&label) {
            let _ = win.hide();
          }
        }
      }
      _ => {}
    },
    _ => {}
  });
}

fn close_app(handle: &&AppHandle) {
  if let Some(window) = handle.get_window("main") {
    let _ = window.show();
    let _ = window.set_focus();
    let _ = window.maximize();

    MessageDialogBuilder::new("Close app", "Do you want to close AHQ Store?")
      .parent(&window)
      .buttons(MessageDialogButtons::YesNo)
      .kind(MessageDialogKind::Warning)
      .show(|close| {
        if close {
          process::exit(0);
        }
      });
  }
}

#[tauri::command(async)]
fn is_an_admin() -> bool {
  true
}

#[tauri::command(async)]
fn get_windows() -> Option<String> {
  Some("linux".into())
}

#[tauri::command(async)]
fn get_linux_distro() -> Option<String> {
  Some(identify()?.name().into())
}

#[tauri::command(async)]
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
  false
}

#[tauri::command(async)]
fn is_development() -> bool {
  cfg!(debug_assertions)
}

#[tauri::command(async)]
fn sys_handler() -> String {
  "".into()
}

#[tauri::command(async)]
fn set_progress(state: i32, c: Option<u64>, t: Option<u64>) {
  let _ = (state, c, t);
}

#[tauri::command(async)]
fn open(url: String) -> Option<()> {
  match open_2::that(url) {
    Ok(_) => Some(()),
    _ => None,
  }
}
