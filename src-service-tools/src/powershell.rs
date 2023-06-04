use reqwest::blocking::Client;

static URL: &str = "https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases/latest";
static SUFFIX: &str = "ahqstore_service.exe";

#[derive(serde::Deserialize, serde::Serialize)]
struct ReleaseData {
    name: String,
    browser_download_url: String,
}

#[derive(serde::Deserialize, serde::Serialize)]
struct PowershellReleaseData {
    assets: Vec<ReleaseData>,
}

pub fn get_ahqstore_service(depth: u8) -> String {
    let resp = Client::new()
        .get(URL)
        .header("User-Agent", "AHQ Store/Tools Installer")
        .send();

    let handle_err = || {
        println!("Error fetching the latest powershell release, Retrying in 10secs");
        std::thread::sleep(std::time::Duration::from_secs(10));
        return get_ahqstore_service(depth + 1);
    };

    if let Ok(response) = resp {
        if let Ok(json) = response.json::<PowershellReleaseData>() {
            let asset = json
                .assets
                .iter()
                .find(|release| release.name.ends_with(SUFFIX));

            if let Some(asset) = asset {
                return asset.browser_download_url.clone();
            } else {
                if depth >= 10 {
                    panic!("Error fetching the latest powershell release.");
                } else {
                    return handle_err();
                }
            }
        } else {
            if depth >= 10 {
                panic!("Error fetching the latest powershell release.");
            } else {
                return handle_err();
            }
        }
    } else {
        if depth >= 10 {
            panic!("Error fetching the latest powershell release.");
        } else {
            return handle_err();
        }
    }
}
