#[macro_use]
extern crate windows_service;

mod ws_receiver;

pub mod app;
pub mod auth;

use std::{
    ffi::OsString,
    fs::write,
    net::TcpListener,
    sync::{Arc, Mutex},
};
use windows_service::{
    service::{
        ServiceControl, ServiceControlAccept, ServiceExitCode, ServiceState, ServiceStatus,
        ServiceType,
    },
    service_control_handler::{self, ServiceControlHandlerResult, ServiceStatusHandle},
    service_dispatcher,
};
use ws::{listen, Message};
use ws_receiver::handle_ws;

define_windows_service!(ffi_service_main, my_service_main);

static ROOT_FILE: &str = "\\ProgramData\\AHQ Store Applications";
static mut ROOT: Option<String> = None;

fn update_file(raw: &str) -> Result<(), std::io::Error> {
    let data = raw.clone().to_owned();

    unsafe {
        let root = ROOT.as_ref().unwrap_or(&"C:".to_string()).clone();

        let file = format!(
            "{}{}\\server.zLsMCFKchEXbnpBDkcJjFXYoapkpXeYDJygFJqXo",
            root, &ROOT_FILE
        );

        match auth::encrypt(data) {
            Some(data) => return write(file, data),
            _ => {
                return Err(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    "Could not encrypt",
                ))
            }
        }
    }
}

fn my_service_main(arguments: Vec<OsString>) {
    let root = std::env::var("SYSTEMROOT")
        .unwrap()
        .to_uppercase()
        .as_str()
        .replace("\\WINDOWS", "")
        .replace("\\Windows", "");

    unsafe {
        ROOT = Some(root);
    }

    if let Err(_e) = run_service(arguments) {
        // Handle errors in some way.
    }
}

fn run_server(port: String, handle: ServiceStatusHandle) {
    std::thread::spawn(move || {
        update_file("STARTING").unwrap();

        app::init();

        update_file(&port).unwrap();

        let mut set = false;

        match listen(&format!("127.0.0.1:{}", port), |out| {
            if !set {
                unsafe{app::set_sender(out.clone());}
                set = true;
            }
            move |msg: Message| {
                handle_ws(msg, out.clone());
                Ok(())
            }
        }) {
            Err(_) => {
                handle
                    .set_service_status(ServiceStatus {
                        service_type: ServiceType::OWN_PROCESS,
                        current_state: ServiceState::Stopped,
                        controls_accepted: ServiceControlAccept::STOP,
                        exit_code: ServiceExitCode::Win32(0),
                        checkpoint: 0,
                        wait_hint: std::time::Duration::default(),
                        process_id: Some(std::process::id()),
                    })
                    .unwrap();

                std::process::exit(1);
            }
            _ => {}
        }
    });
}

fn run_on_available_port(handle: ServiceStatusHandle) {
    if let Some(available_port) = get_available_port() {
        run_server(available_port, handle);
    } else {
        handle
            .set_service_status(ServiceStatus {
                service_type: ServiceType::OWN_PROCESS,
                current_state: ServiceState::Stopped,
                controls_accepted: ServiceControlAccept::STOP,
                exit_code: ServiceExitCode::Win32(0),
                checkpoint: 0,
                wait_hint: std::time::Duration::default(),
                process_id: Some(std::process::id()),
            })
            .unwrap();

        std::process::exit(1);
    }
}

fn get_available_port() -> Option<String> {
    (49152..65535)
        .find(|port| port_is_available(*port))
        .map(|port| port.to_string())
}

fn port_is_available(port: u16) -> bool {
    match TcpListener::bind(("127.0.0.1", port)) {
        Ok(_) => true,
        Err(_) => false,
    }
}

fn run_service(_: Vec<OsString>) -> Result<(), windows_service::Error> {
    let handler: Arc<Mutex<Option<ServiceStatusHandle>>> = Arc::new(Mutex::new(None));

    let status_handle = handler.clone();

    let event_handler = move |control_event| -> ServiceControlHandlerResult {
        match control_event {
            ServiceControl::Stop => {
                update_file("STOPPED").unwrap_or(());

                // Handle stop event and return control back to the system.
                status_handle
                    .lock()
                    .unwrap()
                    .unwrap()
                    .set_service_status(ServiceStatus {
                        service_type: ServiceType::OWN_PROCESS,
                        current_state: ServiceState::Stopped,
                        controls_accepted: ServiceControlAccept::STOP,
                        exit_code: ServiceExitCode::Win32(0),
                        checkpoint: 0,
                        wait_hint: std::time::Duration::default(),
                        process_id: Some(std::process::id()),
                    })
                    .unwrap();

                ServiceControlHandlerResult::NoError
            }
            // All services must accept Interrogate even if it's a no-op.
            ServiceControl::Interrogate => ServiceControlHandlerResult::NoError,
            _ => ServiceControlHandlerResult::NotImplemented,
        }
    };

    let handle_clone = handler.clone();

    // Register system service event handler
    let status_handle = service_control_handler::register("AHQ Store", event_handler)?;

    match handle_clone.lock() {
        Ok(mut handle) => {
            *handle = Some(status_handle.clone());
        }
        _ => {}
    }

    status_handle
        .set_service_status(ServiceStatus {
            service_type: ServiceType::OWN_PROCESS,
            current_state: ServiceState::Running,
            controls_accepted: ServiceControlAccept::STOP,
            exit_code: ServiceExitCode::Win32(0),
            checkpoint: 0,
            wait_hint: std::time::Duration::default(),
            process_id: Some(std::process::id()),
        })
        .unwrap();

    run_on_available_port(status_handle.clone());

    Ok(())
}

fn main() -> Result<(), windows_service::Error> {
    service_dispatcher::start("AHQ Store", ffi_service_main)?;
    Ok(())
}
