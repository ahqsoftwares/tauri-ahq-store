#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

pub mod extract;
pub mod download;

use std::path::Path;
use std::{thread, fs};
use tauri::SystemTray;


fn main() {
  /*download(String::from("https://github.com/ahqsoftwares/Simple-Host-App/releases/download/v2.1.0/Simple-Host-Desktop-Setup-2.1.0.exe"), String::from("./installs/"));
  install(String::from("./installs/Simple-Host-Desktop-Setup-2.1.0.exe"));*/
  let context = tauri::generate_context!();
  tauri::Builder::default()
    .system_tray(SystemTray::new())
    .invoke_handler(tauri::generate_handler![download, install, extract, clean])
    .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
      println!("{}, {argv:?}, {cwd}", app.package_info().name);
    }))
    .menu(if cfg!(target_os = "macos") {
      tauri::Menu::os_default(&context.package_info().name)
    } else {
      tauri::Menu::default()
    })
    .run(context)
    .expect("error while running tauri application");
}


#[tauri::command(async)]
fn download(url: String) -> Result<i32, i32> {
  thread::spawn(move || {
    let result = fs::create_dir_all("C:\\ProgramData\\AHQ Store Applications\\Installers");
    match result {
      Ok(()) => println!("Success!"),
      Err(_status) => println!("Error")
    }
    download::download(url.as_str(), "C:\\ProgramData\\AHQ Store Applications\\Installers");
  }).join().expect("Thread panicked");
  
  Ok(0.into())
}

#[tauri::command(async)]
fn install(path: String) -> Result<bool, i32> {
  let status = extract::run(path);
  Ok(status.into())
}

#[tauri::command(async)]
fn extract(app: &str, installer: &str) -> Result<i32, i32> {
  let status = extract::extract(&Path::new(&("C:\\ProgramData\\AHQ Store Applications\\Installers\\".to_owned() + installer)), &Path::new(&("C:\\ProgramData\\AHQ Store Applications\\Programs\\".to_owned() + app)));

  Ok(status.into())
}

#[tauri::command(async)]
fn clean(path: String) {
  fs::remove_file(path).unwrap();
}