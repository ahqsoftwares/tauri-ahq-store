use std::sync::{Arc, Mutex};

use windows_service::{
    define_windows_service,
    service_control_handler::{self, ServiceControlHandlerResult, ServiceStatusHandle},
    service_dispatcher,
    Result as SResult, 
    service::*
};

use actix::{Actor, StreamHandler};
use actix_web::{web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws::{
    start, CloseCode, CloseReason, Message, ProtocolError, WebsocketContext,
};

#[cfg(not(debug_assertions))]
static MAX_WS: u64 = 1;
#[cfg(debug_assertions)]
static MAX_WS: u64 = 1;
static mut CURRENT_WS: u64 = 0;

mod ws_handler;
mod authentication;

struct MyWs;

impl Actor for MyWs {
    type Context = WebsocketContext<Self>;
}

fn close(ctx: &mut <MyWs as Actor>::Context, code: CloseCode) {
    ctx.close(Some(CloseReason {
        code,
        description: None,
    }));
    unsafe {
        if CURRENT_WS > 0 {
            CURRENT_WS -= 1;
        }
    }
}

impl StreamHandler<Result<Message, ProtocolError>> for MyWs {
    fn handle(&mut self, msg: Result<Message, ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(Message::Ping(msg)) => ctx.pong(&msg),
            Ok(Message::Text(text)) => ctx.text(text),
            Ok(Message::Binary(_)) => {
                close(ctx, CloseCode::Unsupported);
            }
            Ok(Message::Close(_)) => {
                close(ctx, CloseCode::Normal);
            }
            _ => ctx.text("\"UNKNOWN ACTION\""),
        }
    }
}

async fn index(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    unsafe {
        if CURRENT_WS + 1 > MAX_WS {
            return Ok(HttpResponse::Unauthorized().body("CURRENT_WS_OVERFLOW"));
        }

        CURRENT_WS += 1;
    }

    let _ = req.headers()
        .get("Authorization")
        .map_or_else(|| "", |x| x.to_str().map_or_else(|_| "", |x| x));

    #[cfg(not(debug_assertions))]
    let is_ahqstore_running = authentication::is_process_running(
        &format!(
            "{}\\Program Files\\AHQ Store\\AHQ Store.exe",
            authentication::get_main_drive()
        )
    );
    #[cfg(debug_assertions)]
    let is_ahqstore_running = true;

    if !is_ahqstore_running {
        return Ok(HttpResponse::Forbidden().body("AHQ Store is not running"));
    }

    let resp = start(MyWs {}, &req, stream);

    resp
}

define_windows_service!(ffi_service_main, ahq_main);


fn main() -> SResult<()> {
    // Register generated `ffi_service_main` with the system and start the service, blocking
    // this thread until the service is stopped.
    service_dispatcher::start("AHQ Store Service", ffi_service_main)?;
    Ok(())
}


fn ahq_main<T>(_: T) {
        let handler: Arc<Mutex<Option<ServiceStatusHandle>>> = Arc::new(Mutex::new(None));

    let status_handle = handler.clone();

    let event_handler = move |control_event| -> ServiceControlHandlerResult {
        match control_event {
            ServiceControl::Stop => {
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
    let status_handle = service_control_handler::register("AHQ Store", event_handler).expect("This should work");

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
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            HttpServer::new(|| App::new().route("/", web::get().to(index)))
            .bind(("127.0.0.1", 8080))?
            .run()
            .await
        })
        .unwrap();
}
