use reqwest::blocking::Client;

static URL: &str = "https://api.github.com/repos/ahqsoftwares/ahq-store-data/commits";

#[derive(serde::Deserialize, serde::Serialize)]
struct Commit {
    sha: String,
}

type Commits = Vec<Commit>;

pub fn get_commit(depth: u8) -> String {
    let resp = Client::new()
        .get(URL)
        .header("User-Agent", "AHQ Store/Service")
        .send();

    let handle_err = || {
        println!("Error fetching the latest powershell release, Retrying in 10secs");
        std::thread::sleep(std::time::Duration::from_secs(10));
        return get_commit(depth + 1);
    };

    if let Ok(response) = resp {
        if let Ok(json) = response.json::<Commits>() {
            let commit = json.first();

            if let Some(commit) = commit {
                return commit.sha.clone();
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
