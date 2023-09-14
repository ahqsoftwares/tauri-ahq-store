use tokio::net::TcpStream;

use futures_util::stream::SplitSink;
use tokio_tungstenite::{tungstenite::Message, WebSocketStream};

pub type ServiceWs = SplitSink<WebSocketStream<TcpStream>, Message>;

static mut WS: Option<ServiceWs> = None;

pub fn set_ws(ws: ServiceWs) {
    unsafe {
        WS = Some(ws);
    }
}

pub fn get_ws() -> Option<&'static mut ServiceWs> {
    unsafe { WS.as_mut() }
}

pub fn remove_ws() {
    unsafe {
        WS = None;
    }
}
