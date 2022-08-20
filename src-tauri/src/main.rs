#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

pub mod extract;
pub mod download;
use std::thread;


fn main() {
  /*download(String::from("https://github.com/ahqsoftwares/Simple-Host-App/releases/download/v2.1.0/Simple-Host-Desktop-Setup-2.1.0.exe"), String::from("./installs/"));
  install(String::from("./installs/Simple-Host-Desktop-Setup-2.1.0.exe"));*/
  let context = tauri::generate_context!();
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![download, install])
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
fn download(url: String, path: String) -> Result<i32, i32> {
  thread::spawn(move || {
    download::download(url.as_str(), path.as_str());
  }).join().expect("Thread panicked");
  
  Ok(0.into())
}

#[tauri::command(async)]
fn install(path: String) -> Result<bool, i32> {
  let status = extract::run(path);
  Ok(status.into())
}