use std::{
    sync::{Arc, Mutex},
    time::Duration,
};

use windows_service::{
    define_windows_service,
    service::*,
    service_control_handler::{self, ServiceControlHandlerResult, ServiceStatusHandle},
    service_dispatcher, Result as SResult,
};

use utils::{delete_log, get_available_port, write_log, write_service};
use ws_handler::launch;

mod authentication;
mod encryption;
mod utils;
mod ws_handler;

pub mod handlers;

define_windows_service!(ffi_service_main, service_runner);

fn main() -> SResult<()> {
    service_dispatcher::start("AHQ Store Service", ffi_service_main)?;
    Ok(())
}

extern "C" {
    fn srand() -> u8;
    fn rand() -> u8;
}

fn start_keep_alive() {
    tokio::spawn(async {
        unsafe {
            srand();
            loop {
                handlers::keep_alive().await;

                let mut mins = rand() / 30;

                if mins < 3 {
                    mins = 3;
                } else if mins > 8 {
                    mins = 8;
                }

                #[cfg(debug_assertions)]
                write_log(format!("KeepAlive: next in {} mins", &mins));

                tokio::time::sleep(Duration::from_secs(mins as u64 * 60)).await;
            }
        }
    });
}

fn service_runner<T>(_: T) {
    let handler: Arc<Mutex<Option<ServiceStatusHandle>>> = Arc::new(Mutex::new(None));

    let status_handle = handler.clone();

    let event_handler = move |control_event| -> ServiceControlHandlerResult {
        match control_event {
            ServiceControl::Stop => {
                delete_log();

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
    let status_handle = service_control_handler::register("AHQ Store Service", event_handler)
        .expect("This should work");

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

    tokio::runtime::Builder::new_current_thread()
        .worker_threads(12)
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            write_log("WIN NT: Selecting PORT");

            let port = get_available_port().unwrap();

            write_service(port.to_string());
            write_log("WIN NT: STARTING");

            #[cfg(debug_assertions)]
            write_log(port);

            start_keep_alive();

            launch(port).await;
        });
}
