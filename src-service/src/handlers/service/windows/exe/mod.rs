use ahqstore_types::AHQStoreApplication;
use tokio::task::JoinHandle;

use crate::handlers::InstallResult;

pub fn install(path: &str, app: &AHQStoreApplication) -> Option<InstallResult> {
  None
}
