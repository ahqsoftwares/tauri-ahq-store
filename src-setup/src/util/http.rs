use std::{fs, time::{Duration, SystemTime, UNIX_EPOCH}};

use iced::futures::{channel::mpsc::Sender, SinkExt};
use lazy_static::lazy_static;
use reqwest::{
    header::{HeaderMap, HeaderValue},
    Client, ClientBuilder,
};
use serde::Deserialize;
use tokio::time::sleep;

use crate::shell;

use super::{system_drive, InstallerWorker, FRAMEWORK};

#[derive(Debug, Deserialize)]
struct Release {
    pub assets: Vec<Asset>,
}

#[derive(Debug, Deserialize)]
pub struct Asset {
    pub name: String,
    pub browser_download_url: String,
}

lazy_static! {
    static ref CLIENT: Client = ClientBuilder::new()
        .default_headers({
            let mut map = HeaderMap::new();

            map.insert(
                "user-agent",
                HeaderValue::from_bytes(b"AHQ Store Installer").unwrap(),
            );

            map
        })
        .build()
        .unwrap();
}

async fn fetch_framework_data() -> Vec<Asset> {
    let url: String =
        "https://api.github.com/repos/ahqsoftwares/ahqstore-app-framework/releases/latest".into();

    let release = CLIENT
        .get(&url)
        .send()
        .await
        .unwrap()
        .json::<Release>()
        .await
        .unwrap();

    release.assets
}

fn now() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs()
}

pub async fn download_framework(out: &mut Sender<InstallerWorker>) {
    let sys = system_drive();

    let dir = FRAMEWORK.replace("{root}", &sys);

    let urls = fetch_framework_data().await;

    for url in urls {
        out.send(InstallerWorker::DownloadingFramework(0))
            .await
            .unwrap();

        let mut bytes = CLIENT.get(url.browser_download_url).send().await.unwrap();

        let mut last_sent = now();

        let mut file: Vec<u8> = vec![];
        let mut downloaded: u64 = 0;
        let total = bytes.content_length().unwrap();

        loop {
            match bytes.chunk().await {
                Ok(Some(chunk)) => {
                    downloaded += chunk.len() as u64;

                    let perc = (downloaded * 100) / total;
                    let now = now();

                    if now - last_sent > 1 || perc == 100 {
                        last_sent = now;

                        out.send(InstallerWorker::DownloadingFramework(
                            perc,
                        ))
                        .await
                        .unwrap();
                    }

                    file.extend(chunk.iter());
                }
                Ok(None) => {
                    sleep(Duration::from_millis(125)).await;

                    let path = format!("{}\\{}", &dir, url.name);

                    let _ = fs::remove_file(&path);
                    fs::write(path, &file).unwrap();

                    drop(file);
                    break;
                }
                _ => {
                    panic!("Failed");
                }
            }
        }
    }

    let _ = (
        fs::remove_dir_all(format!("{}\\js", &dir)),
        fs::remove_dir_all(format!("{}\\node", &dir)),
    );

    out.send(InstallerWorker::InstallingFramework)
        .await
        .unwrap();

    sleep(Duration::from_millis(1000)).await;

    shell::launch(
        &[
            "Expand-Archive",
            &format!("\"{}\\js.zip\"", &dir),
            &format!("-DestinationPath \"{}\\js\"", &dir),
        ],
        None,
    );
    shell::launch(
        &[
            "Expand-Archive",
            &format!("\"{}\\node.zip\"", &dir),
            &format!("-DestinationPath \"{}\\node\"", &dir),
        ],
        None,
    );

    fs::remove_file(&format!("\"{}\\node.zip\"", &dir)).unwrap();
    fs::remove_file(&format!("\"{}\\js.zip\"", &dir)).unwrap();

    out.send(InstallerWorker::Installed).await.unwrap();

    sleep(Duration::from_millis(125)).await;
}
