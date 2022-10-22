#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

pub mod download;
pub mod extract;

use mslnk::ShellLink;
use deelevate::{Token, PrivilegeLevel};
use std::path::Path;
use std::process;
use std::{fs, thread, process::Command};
use tauri::{CustomMenuItem, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu};

fn main() {
    let sys_dir = std::env::var("SYSTEMROOT").unwrap().as_str().replace("\\WINDOWS", "");

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

            Command::new("powershell.exe")
                .env("WindowStyle", "HIDDEN")
                .arg(format!("start-process \"{}\" -verb runas", exec.as_str()))
                .spawn()
                .unwrap()
                .wait()
                .unwrap();

            process::exit(0);
        }
        _ => {
                        
        }
    }

    tauri_plugin_deep_link::prepare("com.ahqsoftwares.store");

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
            download, install, extract, clean, shortcut, check_app, uninstall
        ])
        .menu(if cfg!(target_os = "macos") {
            tauri::Menu::os_default(&context.package_info().name)
        } else {
            tauri::Menu::default()
        })
        .build(context)
        .unwrap();

    let window = tauri::Manager::get_window(&app, "main").unwrap();
    let mainwindow = tauri::Manager::get_window(&app, "main").unwrap();

    tauri_plugin_deep_link::register("ahqstore", move |request| {
        println!("Request Data {}", &request);
        mainwindow.show().unwrap();
        mainwindow.emit("protocol", request).unwrap();
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
fn download(url: String, name: String) -> Result<(), u8> {
    let data = thread::spawn(move || {
        let sys_dir = std::env::var("SYSTEMROOT").unwrap().as_str().replace("\\WINDOWS", "");
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
fn extract(app: &str, installer: &str) -> Result<(), i32> {
    let sys_dir = std::env::var("SYSTEMROOT").unwrap().as_str().replace("\\WINDOWS", "");
    let status = extract::extract(
        &Path::new(
            &format!("{}\\ProgramData\\AHQ Store Applications\\Installers\\{}", sys_dir.clone(), installer),
        ),
        &Path::new(&format!("{}\\ProgramData\\AHQ Store Applications\\Programs\\{}", sys_dir.clone(), app)),
    );

    if status == 0 {
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
    let sys_dir = std::env::var("SYSTEMROOT").unwrap().as_str().replace("\\WINDOWS", "");
    let base = format!(r"{}\ProgramData\AHQ Store Applications\Programs\", sys_dir).to_owned() + app;

    let sl = ShellLink::new(base).unwrap();

    sl.create_lnk(&std::path::Path::new(&format!(r"{}\Users\Public\Desktop\{app_name}.lnk", sys_dir.clone()))).unwrap();
    sl.create_lnk(std::path::Path::new(&format!(r"{}\ProgramData\Microsoft\Windows\Start Menu\Programs\AHQ Store\{}.lnk", sys_dir, app_name))).unwrap();
}

#[tauri::command(async)]
fn check_app(app_name: &str) -> Result<bool, bool> {
    let sys_dir = std::env::var("SYSTEMROOT").unwrap().as_str().replace("\\WINDOWS", "");
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
    let sys_dir = std::env::var("SYSTEMROOT").unwrap().as_str().replace("\\WINDOWS", "");
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
