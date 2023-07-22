use crate::{
    app::{
        get_apps, get_commit_id, get_update_stats, install_apps, list_apps, run_update,
        uninstall_apps,
    },
    auth,
};

use serde::{Deserialize, Serialize};
use serde_json::from_str;

use ws::{CloseCode, Message, Sender, Error};

#[cfg(not(debug_assertions))]
use crate::auth::{
    encrypt,
    decrypt
};

#[cfg(not(debug_assertions))]
use serde_json::to_string;

#[cfg(debug_assertions)]
use serde_json::to_string_pretty;

mod get;
mod install;
mod uninstall;
mod update;

#[derive(Deserialize, Serialize)]
struct WsMessage {
    module: String,
    token: String,
    data: Option<String>,
}

type AppList = Vec<String>;

#[derive(Debug)]
#[allow(dead_code)]
enum Payload<'a> {
    Debug(Result<&'a str, Error>),
    Prod(Option<String>)
}

pub fn handle_ws(msg: Message, out: Sender) {
    let mut out = out;

    let payload = Payload::Debug(msg.as_text());

    #[cfg(not(debug_assertions))]
    let payload = Payload::Prod(
        match payload {
            Payload::Debug(Ok(txt)) => decrypt(txt.to_string()),
            _ => None,
        }
    );

    if let Some(txt) = extract_value(&payload) {
        if let Ok(json) = from_str::<WsMessage>(&txt) {
            if !auth::verify_pwd(&json.token) {
                send_invalid(r#""Invalid Token""#, txt.clone().to_owned(), &mut out);
            } else {
                match json.module.as_str() {
                    "APPS" => {
                        let data = json.data.clone().unwrap_or(String::new());

                        if let Ok(apps) = from_str::<AppList>(data.as_str()) {
                            if get_apps(txt.clone().to_string(), apps, out.clone()) {
                                send_processing(&mut out, txt.clone().to_string());
                            } else {
                                send_error(&mut out, txt.clone().to_string());
                            }
                        } else {
                            send_invalid_payload(&mut out, txt.to_owned());
                        }
                    }
                    "INSTALL" => {
                        let data = json.data.clone().unwrap_or(String::new());

                        if let Ok(apps) = from_str::<AppList>(data.as_str()) {
                            if install_apps(txt.clone().to_string(), apps, out.clone()) {
                                send_processing(&mut out, txt.clone().to_string());
                            } else {
                                send_error(&mut out, txt.clone().to_string());
                            }
                        } else {
                            send_invalid_payload(&mut out, txt.to_owned());
                        }
                    }
                    "UNINSTALL" => {
                        let data = json.data.clone().unwrap_or(String::new());

                        if let Ok(apps) = from_str::<AppList>(data.as_str()) {
                            if uninstall_apps(txt.clone().to_string(), apps, out.clone()) {
                                send_processing(&mut out, txt.clone().to_string());
                            } else {
                                send_error(&mut out, txt.clone().to_string());
                            }
                        } else {
                            send_invalid_payload(&mut out, txt.to_owned());
                        }
                    }
                    "UPDATE" => {
                        let data = get_update_stats(txt.clone().to_string(), out.clone());

                        if data {
                            send_processing(&mut out, txt.clone().to_string());
                        } else {
                            send_error(&mut out, txt.clone().to_string());
                        }
                    }
                    "CHECKUPDATE" => {
                        let data = run_update(txt.clone().to_string(), out.clone());

                        if data {
                            send_processing(&mut out, txt.clone().to_string());
                        } else {
                            send_error(&mut out, txt.clone().to_string());
                        }
                    }
                    "LISTAPPS" => {
                        let no_err = list_apps(txt.clone().to_string(), out.clone());

                        if !no_err {
                            send_error(&mut out, txt.clone().to_owned());
                        } else {
                            send_processing(&mut out, txt.clone().to_owned());
                        }
                    }
                    "COMMIT" => {
                        let no_err = get_commit_id(txt.clone().to_string(), out.clone());

                        if !no_err {
                            send_error(&mut out, txt.clone().to_owned());
                        } else {
                            send_processing(&mut out, txt.clone().to_owned());
                        }
                    }
                    _ => {
                        send_invalid(r#""Invalid Method""#, txt.clone().to_owned(), &mut out);
                    }
                };
            }
        } else {
            send_invalid(r#""Invalid JSON""#, txt.clone().to_owned(), &mut out);
        }
    } else {
        send_invalid(
            r#""Invalid Format""#,
            format!("{:?}", &payload),
            &mut out,
        );
    }
}

#[derive(Serialize, Deserialize)]
struct HTTPWsResponse {
    reason: Option<String>,
    status: Option<String>,
    ref_id: String,
    auth: String,
}

fn send_invalid(reason: &str, payload: String, out: &mut Sender) {
    send_resp(
        Some(CloseCode::Invalid),
        Some(reason.to_string()),
        None,
        payload,
        out,
    );
}

fn send_invalid_payload(out: &mut Sender, payload: String) {
    send_invalid(r#""Invalid Payload""#, payload, out);
}

fn send_processing(out: &mut Sender, payload: String) {
    send_resp(
        None,
        None,
        Some(r#""Processing...""#.to_string()),
        payload,
        out,
    );
}

fn send_error(out: &mut Sender, payload: String) {
    send_invalid(r#""An Error Occured""#, payload, out);
}

fn send_resp(
    code: Option<CloseCode>,
    reason: Option<String>,
    status: Option<String>,
    payload: String,
    out: &mut Sender,
) {
    let err = HTTPWsResponse {
        reason,
        status,
        ref_id: payload,
        auth: include!("./auth/hash").to_string(),
    };

    #[cfg(debug_assertions)]
    {
        let resp = to_string_pretty(&err).unwrap();

        out.send(resp).unwrap_or(());
    }

    #[cfg(not(debug_assertions))]
    {
        let resp = to_string(&err).unwrap();

        if let Some(x) = encrypt(resp) {
            out.send(to_string(&x).unwrap()).unwrap_or(());
        }
    }

    if let Some(code) = code {
        out.close(code).unwrap_or(());
    }
}

fn extract_value(payload: &Payload) -> Option<String> {
    match payload {
        Payload::Prod(x) => x.clone(),
        Payload::Debug(x) => match x {
            Ok(x) => Some(x.to_string()),
            _ => None
        }
    }
}