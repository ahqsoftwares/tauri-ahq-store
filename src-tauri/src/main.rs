#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

pub mod download;
pub mod extract;

use dirs;
use mslnk::ShellLink;
use std::path::Path;
use std::{fs, thread};
use tauri::{CustomMenuItem, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu};

fn main() {
    tauri_plugin_deep_link::prepare("com.ahqsoftwares.store");

    let context = tauri::generate_context!();
    let app = tauri::Builder::default()
        .setup(|_| {
            /*let main = tauri::Manager::get_window(app, "main").unwrap();
            main.hide().unwrap();*/
            fs::create_dir_all("C:\\ProgramData\\AHQ Store Applications\\Installers")
                .expect("Error");
            fs::create_dir_all("C:\\ProgramData\\AHQ Store Applications\\Programs")
                .expect("Error!");
            fs::create_dir_all("C:\\ProgramData\\AHQ Store Applications\\Updaters")
                .expect("Error!");

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
fn download(url: String, name: String) -> Result<i32, i32> {
    thread::spawn(move || {
        let result = fs::create_dir_all("C:\\ProgramData\\AHQ Store Applications\\Installers");
        match result {
            Ok(()) => println!("Success!"),
            Err(_status) => println!("Error"),
        }
        download::download(
            url.as_str(),
            "C:\\ProgramData\\AHQ Store Applications\\Installers",
            name.as_str(),
        );
    })
    .join()
    .expect("Thread panicked");

    Ok(0.into())
}

#[tauri::command(async)]
fn install(path: String) -> Result<bool, i32> {
    let status = extract::run(path);
    Ok(status.into())
}

#[tauri::command(async)]
fn extract(app: &str, installer: &str) -> Result<i32, i32> {
    let status = extract::extract(
        &Path::new(
            &("C:\\ProgramData\\AHQ Store Applications\\Installers\\".to_owned() + installer),
        ),
        &Path::new(&("C:\\ProgramData\\AHQ Store Applications\\Programs\\".to_owned() + app)),
    );

    Ok(status.into())
}

#[tauri::command(async)]
fn clean(path: String) {
    fs::remove_file(path).unwrap();
}

#[tauri::command(async)]
fn shortcut(app: &str, app_short: &str) {
    let base = r"C:\ProgramData\AHQ Store Applications\Programs\".to_owned() + app;

    let sl = ShellLink::new(base).unwrap();
    let mut path = dirs::desktop_dir().unwrap();
    path.push(format!("{}.lnk", app_short));

    sl.create_lnk(&path.as_path()).unwrap();
}

#[tauri::command(async)]
fn check_app(app_name: &str) -> Result<bool, bool> {
    Ok(
        Path::new(
            format!("C:\\ProgramData\\AHQ Store Applications\\Programs\\{app_name}").as_str(),
        )
        .is_dir()
        .into(),
    )
}

#[tauri::command(async)]
fn uninstall(app_name: &str) -> Result<(), bool> {
    fs::remove_dir_all(
        format!("C:\\ProgramData\\AHQ Store Applications\\Programs\\{app_name}").as_str(),
    )
    .expect("Failed!");

    let mut path = dirs::desktop_dir().unwrap();
    path.push(format!("{}.lnk", app_name));

    fs::remove_file(
        format!("C:\\ProgramData\\AHQ Store Applications\\Updaters\\{app_name}.updater").as_str(),
    )
    .expect("Failed!");

    match fs::remove_file(&path) {
        Err(_err) => {
            println!("App wasn't found maybe?");
            Ok(())
        }
        Ok(()) => Ok(()),
    }
}
