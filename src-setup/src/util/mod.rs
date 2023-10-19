mod other;

use std::time::Duration;

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
  Installed,
}

static mut INSTALL_STAT: bool = false;

pub fn subscribe() -> Subscription<InstallerWorker> {
  subscription::channel(0, 100, |mut out| async move {
    loop {
      let install = unsafe { INSTALL_STAT };

      if install {
        out.send(InstallerWorker::MsiInstalling).await.unwrap();

        sleep(Duration::from_millis(100)).await;

        download_bins().await;

        sleep(Duration::from_millis(100)).await;

        install_msi();

        out.send(InstallerWorker::ServiceInstalling).await.unwrap();

        sleep(Duration::from_millis(100)).await;

        install_service();

        sleep(Duration::from_millis(1000)).await;

        out.send(InstallerWorker::Installed).await.unwrap();

        unsafe {
          INSTALL_STAT = false;
        }
      }

      sleep(Duration::from_millis(100)).await;
    }
  })
}

pub fn start_install() {
  unsafe { INSTALL_STAT = true }
}
