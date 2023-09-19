use lazy_static::lazy_static;
use reqwest::{Client, ClientBuilder};

use crate::utils::structs::{AHQStoreApplication, AppId, Response};

static URL: &str = "https://ahqstore-server.onrender.com";

lazy_static! {
    static ref CLIENT: Client = ClientBuilder::new()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36")
        .build()
        .unwrap();
}

pub async fn _download() {}

pub async fn get_app(app_id: AppId) -> Response {
    let url = format!("{}/apps/id/{app_id}", &URL);

    if let Some(x) = CLIENT.get(url).send().await.ok() {
        if let Some(x) = x.json::<AHQStoreApplication>().await.ok() {
            return Response::AppData(app_id, x);
        }
    }
    Response::GetAppFailed(app_id)
}
