use std::{env, fs};
use serde_json::from_str;

fn main() {
    let profile = env::var("PROFILE").unwrap();

    if &profile == "RELEASE" {
        let gh_path_to_service = "D:\\a\\tauri-ahq-store\\src-service\\target\\release\\ahqstore_service.exe";

        let paths = env::var("PATHS").unwrap();

        let json: Vec<String> = from_str(&paths).unwrap();

        let data = json.iter().find(|path| path.ends_with(".msi"));

        if let Some(data) = data {
            fs::copy(data, "./src/bin/installer.msi").unwrap();
            fs::copy(gh_path_to_service, "./src/bin/service.exe").unwrap();
        }
    }
}
