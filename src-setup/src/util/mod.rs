mod http;
mod other;

use std::time::Duration;

use http::download_framework;
use iced::{
    futures::SinkExt,
    subscription::{self, Subscription},
};
use tokio::time::sleep;

pub use other::*;

#[derive(Debug, Clone, Copy)]
pub enum InstallerWorker {
    MsiInstalling,
    ServiceInstalling,
    DownloadingFramework(u64),
    InstallingFramework,
    Installed,
}

static mut INSTALL_STAT: (bool, bool) = (false, true);

pub fn subscribe() -> Subscription<InstallerWorker> {
    subscription::channel(0, 100, |mut out| async move {
        loop {
            let (install, include_framework) = unsafe { INSTALL_STAT };

            if install {
                out.send(InstallerWorker::MsiInstalling).await.unwrap();

                sleep(Duration::from_millis(100)).await;

                install_msi();

                out.send(InstallerWorker::ServiceInstalling).await.unwrap();

                sleep(Duration::from_millis(100)).await;

                install_service();

                sleep(Duration::from_millis(1000)).await;

                if include_framework {
                    out.send(InstallerWorker::DownloadingFramework(0))
                        .await
                        .unwrap();

                    download_framework(&mut out).await;

                    out.send(InstallerWorker::Installed).await.unwrap();

                    sleep(Duration::from_millis(100)).await;

                    println!("Shutting down");

                    sleep(Duration::from_millis(2000)).await;

                    std::process::exit(0);
                } else {
                    out.send(InstallerWorker::Installed).await.unwrap();
                }

                unsafe {
                    INSTALL_STAT = (false, false);
                }
            }

            sleep(Duration::from_millis(100)).await;
        }
    })
}

pub fn start_install(install_framework: bool) {
    unsafe { INSTALL_STAT = (true, install_framework) }
}
