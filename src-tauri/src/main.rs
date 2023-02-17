#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

pub mod download;
pub mod extract;

//utilities
use minisign_verify::{PublicKey, Signature, Error};
use base64::{self, Engine};
use mslnk::ShellLink;
use deelevate::{Token, PrivilegeLevel};

use std::env::current_exe;
//std
use std::os::windows::process::CommandExt;
use std::{path::Path, fs, thread, process::{self, Stdio, exit}, env::args, process::Command, sync::{Arc, Mutex}};
use os_version::Windows;

//tauri
use tauri_plugin_autostart::MacosLauncher;
use tauri::{CustomMenuItem, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu};

#[derive(Debug, Clone)]
struct AppData {
    pub name: String,
    pub data: String
}

fn main() {
    tauri_plugin_deep_link::prepare("com.ahqsoftwares.store");
    let sys_dir = std::env::var("SYSTEMROOT").unwrap().to_uppercase().as_str().replace("\\WINDOWS", "").replace("\\Windows", "");
    match Token::with_current_process().unwrap().privilege_level().unwrap() {
        PrivilegeLevel::NotPrivileged => {
            let buf = std::env::current_exe().unwrap().to_owned();
            let exec = buf.clone().to_str().unwrap().to_owned();

            let args = std::env::args();

            if std::env::args().last().unwrap().as_str() != exec.clone().as_str() {
                Command::new("powershell")
                    .creation_flags(0x08000000)
                    .args([
                        "-NoProfile",
                        "-WindowStyle", 
                        "Minimized"
                    ])
                    .args([
                        "Start-Process",
                        "-FilePath",
                        format!("\"{}\"", exec.as_str()).as_str(),
                        format!("\"{}\"", args.last().unwrap()).as_str(),
                        "-verb",
                        "runas"
                    ])
                    .spawn()
                    .unwrap()
                    .wait()
                    .unwrap();
            } else {
                Command::new("powershell")
                    .creation_flags(0x08000000)
                    .args([
                        "-NoProfile",
                        "-WindowStyle", 
                        "Minimized"
                    ])
                    .args([
                        "Start-Process",
                        "-FilePath",
                        format!(r#""{}""#, exec.as_str()).as_str(),
                        "-verb",
                        "runas"
                    ])
                    .spawn()
                    .unwrap()
                    .wait()
                    .unwrap();
            }
            process::exit(0);
        }
        _ => {
                        
        }
    }

    fs::create_dir_all(format!("{}\\ProgramData\\AHQ Store Applications\\Installers", sys_dir.clone()))
        .unwrap();
    fs::create_dir_all(format!("{}\\ProgramData\\AHQ Store Applications\\Programs", sys_dir.clone()))
        .unwrap();
    fs::create_dir_all(format!("{}\\ProgramData\\AHQ Store Applications\\Updaters", sys_dir.clone()))
        .unwrap();
    
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

            listener.listen("ready", move |_| {
                println!("ready");

                *ready_clone.lock().unwrap() = true;

                for item in queue_clone.lock().unwrap().iter() {
                    window_clone.emit(item.name.as_str(), item.data.clone()).unwrap();
                }

                let lock = queue_clone.lock();

                if lock.is_ok() {
                  *lock.unwrap() = Vec::<AppData>::new();
                }
            });

            if std::env::args().last().unwrap().as_str() != exec.clone().as_str() {
                let args = args.last().unwrap_or(String::from(""));

                println!("Started with {}", args);

                if *ready.clone().lock().unwrap() {
                    window.emit("app", args.clone()).unwrap();
                } else {
                    queue.clone().lock().unwrap().push(AppData {
                        data: args.clone(),
                        name: String::from("app")
                    });
                }
            }

            let window = window.clone();
            tauri_plugin_deep_link::register(
                "ahqstore",
                move |request| {
                    println!("{:?}", request);
                    window.emit("app", request).unwrap_or(());
                },
            )
            .unwrap();

            Ok(())
        })
        .system_tray(SystemTray::new().with_menu(
            SystemTrayMenu::new().add_item(CustomMenuItem::new("quit".to_string(), "Close App")),
        ))
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            tauri::Manager::get_window(app, "main")
                .unwrap()
                .show()
                .unwrap();
        }))
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(["autostart"].to_vec())))
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                println!("Received a left Click");
                tauri::Manager::get_window(app, "main")
                    .unwrap()
                    .show()
                    .unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => std::process::exit(0),
                _ => println!("Not found!"),
            },
            _ => {
                println!("Unknown command!");
            }
        })
        .invoke_handler(tauri::generate_handler![
            download, install, extract, clean, shortcut, check_app, uninstall,
            autostart, get_windows, list_all_apps, sys_handler, check_update, install_update
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
            window2.emit("sendUpdaterStatus", event.payload().unwrap()).unwrap();
        });
    }

    app.run(move |_, event| match event {
        RunEvent::ExitRequested { api, .. } => {
            api.prevent_exit();
        }
        RunEvent::WindowEvent { event, .. } => match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                window.hide().unwrap();
            }
            _ => {}
        },
        _ => {}
    });

}

fn base64_to_string(base64_string: &str) -> Option<String> {
    let base64decoder =  base64::engine::general_purpose::STANDARD;
    let decoded_string = base64decoder.decode(base64_string).unwrap_or(vec![]);

    let result = String::from_utf8(decoded_string).unwrap_or("".to_string());
    Some(result)
}

const UPDATER_PATH: &str = "%root%\\ProgramData\\AHQ Store Applications\\Updaters";

#[tauri::command]
async fn check_update(version: String, current_version: String, download_url: String, signature: String) -> bool {
    let mut update_available = &version != &current_version;

    if update_available.clone() {
        println!("Update Available!");
        let sys_dir = std::env::var("SYSTEMROOT").unwrap().to_uppercase().as_str().replace("\\WINDOWS", "").replace("\\Windows", "");
        
        let path = UPDATER_PATH.replace("%root%", sys_dir.as_str());

        fs::remove_file(
            format!("{}\\updater.zip", path.clone())
        ).unwrap_or(());

        let path2 = path.clone();
        thread::spawn(move || {
            download::download(download_url.as_str(), path2.as_str(), "updater.zip");
        }).join().unwrap();

        let data = std::fs::read(
            format!("{}\\updater.zip", path.clone())
        ).unwrap_or(vec![]);

        update_available = verify_signature(data, signature.as_str()).unwrap_or(false);
    }

    update_available
}

fn verify_signature(data: Vec<u8>, release_signature: &str) -> Result<bool, Error> {
    let pub_key = base64_to_string("dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEFBQUQxRTExODc4NUUyQUMKUldTczRvV0hFUjZ0cWlOczRIQjlVTDFiWUhRUlNsMERZTm9hdGJzVTc1UUtEajBPSnVydWVMc0YK").unwrap_or("".to_string());
    let key_verifier = PublicKey::decode(&pub_key)?;

    let signature_decoded = base64_to_string(release_signature).unwrap_or("".to_string());
    let signature = Signature::decode(&signature_decoded)?;

    key_verifier.verify(&data, &signature, true)?;
    Ok(true)
}

#[tauri::command]
async fn install_update() {
    let sys_dir = std::env::var("SYSTEMROOT").unwrap().to_uppercase().as_str().replace("\\WINDOWS", "").replace("\\Windows", "");
    let path = UPDATER_PATH.replace("%root%", sys_dir.as_str());

    Command::new("powershell")
        .creation_flags(0x08000000)
        .args([
            "Expand-Archive",
            format!("-Path \"{}\\updater.zip\"", path.clone()).as_str(),
            format!("-DestinationPath \"{}\"", path.clone()).as_str(),
            "-Force"
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
        .args([
            "Start-Process",
            "-Wait",
        ])
        .arg(app_executable)
        .arg("; start-process")
        .arg(current_exe_arg)
        .spawn()
        .unwrap();

    exit(0);
}

#[tauri::command]
fn sys_handler() -> String {
    std::env::var("SYSTEMROOT").unwrap().to_uppercase().as_str().replace("\\WINDOWS", "").replace("\\Windows", "")
}

#[tauri::command(async)]
fn autostart() -> bool {
  let mut status = false;

  if args().len() > 1 {
    if args().last().unwrap() == "autostart" {
        status = true;
    }
  }

  status.into()
}

#[tauri::command(async)]
fn list_all_apps() -> [Vec<String>; 2] {
    let mut apps: Vec<String> = Vec::new();
    let mut versions: Vec<String> = Vec::new();
    let sys_dir = std::env::var("SYSTEMROOT").unwrap().to_uppercase().as_str().replace("\\WINDOWS", "").replace("\\Windows", "");

    let pages = fs::read_dir(
        format!(r"{}\ProgramData\AHQ Store Applications\Programs", sys_dir.clone())
    ).unwrap();

    for page in pages {
        let name = page.unwrap().file_name().into_string().unwrap();

        let version = fs::read_to_string(format!(r"{}\ProgramData\AHQ Store Applications\Programs\{}\ahqStoreVersion", sys_dir.clone(), name.clone())).unwrap_or("v0.0.0".to_string());

        versions.push(version);
        apps.push(name);
    }

    [apps, versions]
}

#[tauri::command]
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
        },
        Err(_) => None
    }
}

fn is_windows_11() -> bool {
    let version = Command::new("cmd")
    .args([
        "/c",
        "ver"
    ])
    .stdout(Stdio::piped())
    .spawn()
    .unwrap()
    .wait_with_output()
    .unwrap()
    .stdout;

    let string = String::from_utf8(version).unwrap();
    let splitted = string.replace("\n", "").replace("Microsoft Windows [", "").replace("]", "");
    let version: Vec<&str> = splitted.split(".").collect();
    
    let version: usize = version[2].parse().unwrap_or(0);
    
    version >= 22000
}

#[tauri::command(async)]
fn download(url: String, name: String) -> Result<(), u8> {
    let data = thread::spawn(move || {
        let sys_dir = std::env::var("SYSTEMROOT").unwrap().to_uppercase().as_str().replace("\\WINDOWS", "").replace("\\Windows", "");
        let result = fs::create_dir_all(format!("{}\\ProgramData\\AHQ Store Applications\\Installers", sys_dir.clone()));
        match result {
            Ok(()) => println!("Success!"),
            Err(_status) => println!("Error"),
        }
        download::download(
            url.as_str(),
            &format!("{}\\ProgramData\\AHQ Store Applications\\Installers", sys_dir.clone()).as_str(),
            name.as_str(),
        );
    })
    .join();

    match data {
        Ok(()) => Ok(().into()),
        Err(_) => Err(1)
    }
}

#[tauri::command(async)]
fn install(path: String) -> Result<bool, i32> {
    let status = extract::run(path);
    
    if status == true {
        Ok(true)
    } else  {
        Err(32)
    }
}

#[tauri::command(async)]
fn extract(app: &str, version: &str) -> Result<(), i32> {
    let sys_dir = std::env::var("SYSTEMROOT").unwrap().to_uppercase().as_str().replace("\\WINDOWS", "").replace("\\Windows", "");
    let status = extract::extract(
        &Path::new(
            &format!("{}\\ProgramData\\AHQ Store Applications\\Installers\\{}.zip", sys_dir.clone(), app.clone()),
        ),
        &Path::new(&format!("{}\\ProgramData\\AHQ Store Applications\\Programs\\{}", sys_dir.clone(), app.clone())),
    );

    let status2 = fs::write(
        &Path::new(&format!("{}\\ProgramData\\AHQ Store Applications\\Programs\\{}\\ahqStoreVersion", sys_dir.clone(), app.clone())), 
        &version
    );

    if status == 0 && !status2.is_err() {
        Ok(())
    } else {
        Err(1)
    }
}

#[tauri::command(async)]
fn clean(path: String) -> Result<(), bool> {
    match fs::remove_file(path) {
        Ok(_) => Ok(()),
        Err(_) => Err(true)
    }
}

#[tauri::command(async)]
fn shortcut(app: &str, app_name: &str) {
    let sys_dir = std::env::var("SYSTEMROOT").unwrap().to_uppercase().as_str().replace("\\WINDOWS", "").replace("\\Windows", "");
    let base = format!(r"{}\ProgramData\AHQ Store Applications\Programs\", sys_dir).to_owned() + app;

    let sl = ShellLink::new(base).unwrap();

    sl.create_lnk(&std::path::Path::new(&format!(r"{}\Users\Public\Desktop\{app_name}.lnk", sys_dir.clone()))).unwrap();
    sl.create_lnk(std::path::Path::new(&format!(r"{}\ProgramData\Microsoft\Windows\Start Menu\Programs\AHQ Store\{}.lnk", sys_dir, app_name))).unwrap();
}

#[tauri::command(async)]
fn check_app(app_name: &str) -> Result<bool, bool> {
    let sys_dir = std::env::var("SYSTEMROOT").unwrap().to_uppercase().as_str().replace("\\WINDOWS", "").replace("\\Windows", "");
    Ok(
        Path::new(
            format!("{sys_dir}\\ProgramData\\AHQ Store Applications\\Programs\\{app_name}").as_str(),
        )
        .is_dir()
        .into(),
    )
}

#[tauri::command(async)]
fn uninstall(app_name: &str, app_full_name: &str) -> Result<(), bool> {
    let sys_dir = std::env::var("SYSTEMROOT").unwrap().to_uppercase().as_str().replace("\\WINDOWS", "").replace("\\Windows", "");
    
    let path = format!("{}\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\AHQ Store\\{}.lnk", sys_dir.clone(), app_full_name.clone());

    fs::remove_dir_all(
        format!("{}\\ProgramData\\AHQ Store Applications\\Programs\\{app_name}", sys_dir.clone()).as_str(),
    )
    .unwrap_or(());

    match std::process::Command::new(
        "powershell"
    )
    .creation_flags(0x08000000)
    .args(["-WindowStyle", "Minimized"])
    .arg(format!("Remove-item \"{}\", \"{}\"",
        format!(r"{sys_dir}\Users\Public\Desktop\{app_full_name}.lnk"),
        path
    ))
    .spawn()
    .unwrap()
    .wait()
    .unwrap()
    .success() {
        true => Ok(()),
        false => Err(false)
    }
}
