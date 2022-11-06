#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

pub mod download;
pub mod extract;

use tauri_plugin_autostart::MacosLauncher;
use mslnk::ShellLink;
use deelevate::{Token, PrivilegeLevel};
use std::path::Path;
use std::{fs, thread, process, env::args, process::Command};
use tauri::{CustomMenuItem, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu};

fn main() {
    tauri_plugin_deep_link::prepare("com.ahqsoftwares.store");
    let sys_dir = std::env::var("SYSTEMROOT").unwrap().to_uppercase().as_str().replace("\\WINDOWS", "").replace("\\Windows", "");
    fs::create_dir_all(format!("{}\\ProgramData\\AHQ Store Applications\\Installers", sys_dir.clone()))
        .unwrap();
    fs::create_dir_all(format!("{}\\ProgramData\\AHQ Store Applications\\Programs", sys_dir.clone()))
        .unwrap();
    fs::create_dir_all(format!("{}\\ProgramData\\AHQ Store Applications\\Updaters", sys_dir.clone()))
        .unwrap();
    
    match Token::with_current_process().unwrap().privilege_level().unwrap() {
        PrivilegeLevel::NotPrivileged => {
            let buf = std::env::current_exe().unwrap().to_owned();
            let exec = buf.clone().to_str().unwrap().to_owned();

            let args = std::env::args();

            if std::env::args().last().unwrap().as_str() != exec.clone().as_str() {
                Command::new("powershell")
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

    let context = tauri::generate_context!();
    let app = tauri::Builder::default()
        .setup(|_| {
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
            autostart, iswindows10, list_all_apps
        ])
        .menu(if cfg!(target_os = "macos") {
            tauri::Menu::os_default(&context.package_info().name)
        } else {
            tauri::Menu::default()
        })
        .build(context)
        .unwrap();

    let window = tauri::Manager::get_window(&app, "main").unwrap();
    let window2 = tauri::Manager::get_window(&app, "main").unwrap();
    let window3 = tauri::Manager::get_window(&app, "main").unwrap();
    let window4 = tauri::Manager::get_window(&app, "main").unwrap();

    window3.listen("sendUpdaterStatus", move |event| {
        window4.emit("sendUpdaterStatus", event.payload().unwrap()).unwrap();
    });

    tauri_plugin_deep_link::register("ahqstore", move |request| {
        println!("Request Data {}", &request);
        window2.show().unwrap();
        window2.emit("protocol", request).unwrap();
    })
    .unwrap();

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

        let version = fs::read_to_string(format!(r"{}\ProgramData\AHQ Store Applications\Programs\{}\ahqStoreVersion", sys_dir.clone(), name.clone())).unwrap();

        versions.push(version);
        apps.push(name);
    }

    [apps, versions]
}

#[tauri::command]
fn iswindows10() -> bool {
    std::env::var("SYSTEMROOT").unwrap().contains("WINDOWS")
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
    let path = format!(r"{}\ProgramData\Microsoft\Windows\Start Menu\Programs\AHQ Store\{}.lnk", sys_dir.clone(), app_full_name.clone());

    let dir = std::path::Path::new(&path);
    fs::remove_dir_all(
        format!("{}\\ProgramData\\AHQ Store Applications\\Programs\\{app_name}", sys_dir.clone()).as_str(),
    )
    .expect("Failed!");

    fs::remove_file(
        format!("{}\\ProgramData\\AHQ Store Applications\\Updaters\\{app_name}.updater", sys_dir.clone()).as_str(),
    )
    .expect("Failed!");

    fs::remove_file(
        dir
    ).expect("Failed");

    match fs::remove_file(&std::path::Path::new(&format!(r"{sys_dir}\Users\Public\Desktop\{app_full_name}.lnk"))) {
        Err(_err) => {
            println!("App wasn't found maybe?");
            Ok(())
        }
        Ok(()) => Ok(()),
    }
}
