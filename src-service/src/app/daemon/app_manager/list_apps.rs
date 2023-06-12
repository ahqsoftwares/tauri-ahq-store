use crate::app::daemon::app_manager::get_root;
use std::fs;

use super::{RawApp, APPS_FOLDER};

pub fn list_apps() -> Vec<RawApp> {
    let folder = format!("{}{}", get_root(), APPS_FOLDER);

    match fs::read_dir(folder) {
        Ok(apps) => apps
            .map(|data| {
                if let Ok(app) = data {
                    let name = app.file_name().to_str().unwrap_or("unknown").to_string();

                    let version = (|| {
                        if let Ok(version) = fs::read_to_string(format!(
                            "{}{}\\{}\\ahqStoreVersion",
                            get_root(),
                            APPS_FOLDER,
                            &name
                        )) {
                            version
                        } else {
                            "0.0.0".to_string()
                        }
                    })();

                    return RawApp {
                        id: name.clone(),
                        version,
                    };
                } else {
                    return RawApp {
                        id: "unknown".to_string(),
                        version: "0.0.0".to_string(),
                    };
                }
            })
            .collect(),
        _ => vec![],
    }
}
