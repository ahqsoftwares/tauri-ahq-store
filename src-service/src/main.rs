#[cfg(windows)]
use std::time::Duration;

#[cfg(windows)]
use std::sync::{Arc, Mutex};

#[cfg(windows)]
use windows_service::{
  define_windows_service,
  service::*,
  service_control_handler::{self, ServiceControlHandlerResult, ServiceStatusHandle},
  service_dispatcher, Result as SResult,
};

use ipc::launch;

#[allow(unused)]
use utils::{delete_log, write_log, write_service};

use self::handlers::init;

pub mod authentication;
mod encryption;
mod ipc;
mod utils;

pub mod handlers;

#[cfg(unix)]
type SResult<T> = Result<T, ()>;

#[cfg(windows)]
define_windows_service!(ffi_service_main, service_runner);

pub fn main() -> SResult<()> {
  #[cfg(windows)]
  #[cfg(not(feature = "no_service"))]
  service_dispatcher::start("AHQ Store Service", ffi_service_main)?;

  #[cfg(any(all(feature = "no_service", windows), target_os = "linux"))]
  service_runner("");
  Ok(())
}

fn service_runner<T>(_: T) {
  #[cfg(all(windows, not(feature = "no_service")))]
  {
    let handler: Arc<Mutex<Option<ServiceStatusHandle>>> = Arc::new(Mutex::new(None));

    let status_handle = handler.clone();

    let event_handler = move |control_event| -> ServiceControlHandlerResult {
      match control_event {
        ServiceControl::Stop => {
          write_service(-1);

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
              wait_hint: Duration::default(),
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
        wait_hint: Duration::default(),
        process_id: Some(std::process::id()),
      })
      .unwrap();
  }

  tokio::runtime::Builder::new_current_thread()
    .worker_threads(10)
    .enable_all()
    .build()
    .unwrap()
    .block_on(async {
      delete_log();

      write_log("WIN NT: Selecting PORT");

      write_log("WIN NT: STARTING");

      init();

      launch().await;
    });
}
