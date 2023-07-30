use reqwest::blocking::Client;

static URL: &str = "https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases/latest";
static AHQSTORE_FRAMEWORK: &str =
    "https://api.github.com/repos/ahqsoftwares/ahqstore-app-framework/releases/latest";

static SUFFIX: &str = "ahqstore_service.exe";

#[derive(serde::Deserialize, serde::Serialize)]
struct ReleaseData {
    name: String,
    browser_download_url: String,
}

#[derive(serde::Deserialize, serde::Serialize)]
struct AHQStoreReleaseData {
    assets: Vec<ReleaseData>,
}

pub fn get_urls(depth: u8, download_framework: bool) -> Vec<String> {
    let resp = Client::new()
        .get(if download_framework {
            AHQSTORE_FRAMEWORK
        } else {
            URL
        })
        .header("User-Agent", "AHQ Store/Tools Installer")
        .send();

    let handle_err = || {
        #[cfg(debug_assertions)]
println!("Error fetching the latest AHQStore release, Retrying in 10secs");
        std::thread::sleep(std::time::Duration::from_secs(10));
        return get_urls(depth + 1, download_framework);
    };

    if let Ok(response) = resp {
        if let Ok(json) = response.json::<AHQStoreReleaseData>() {
            if download_framework {
                return json
                    .assets
                    .iter()
                    .map(|x| x.browser_download_url.to_string())
                    .collect();
            } else {
                let asset = json
                    .assets
                    .iter()
                    .find(|release| release.name.ends_with(SUFFIX));

                if let Some(asset) = asset {
                    return vec![asset.browser_download_url.clone()];
                } else {
                    if depth >= 10 {
                        panic!("Error fetching the latest AHQStore release.");
                    } else {
                        return handle_err();
                    }
                }
            }
        } else {
            if depth >= 10 {
                panic!("Error fetching the latest AHQStore release.");
            } else {
                return handle_err();
            }
        }
    } else {
        if depth >= 10 {
            panic!("Error fetching the latest AHQStore release.");
        } else {
            return handle_err();
        }
    }
}
