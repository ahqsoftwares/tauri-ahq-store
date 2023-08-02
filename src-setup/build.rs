use std::{env, fs};

fn main() {
    let profile = env::var("PROFILE").unwrap();

    if &profile == "RELEASE" {
        let gh_path_to_service = "D:\\a\\tauri-ahq-store\\tauri-ahq-store\\src-service\\target\\release\\ahqstore_service.exe";

        fs::copy(gh_path_to_service, "./src/bin/service.exe").unwrap();

        let dir_to_look = r#"D:\a\tauri-ahq-store\tauri-ahq-store\src-tauri\target\release\bundle\msi\"#;

        let mut path = String::from(dir_to_look.clone());

        let entries = fs::read_dir(dir_to_look).unwrap();

        for entry in entries {
            let entry = entry.unwrap();

            let file_name = entry.file_name();
            let file_name = file_name.to_str().unwrap();

            if file_name.ends_with(".msi") {
                path.push_str(file_name.clone());
                break;
            }
        }

        fs::copy(path, "./src/bin/installer.msi").unwrap();
    }
}
