use crate::app::daemon::app_manager::GITHACK;

use super::{App, GithubApp, RawAuthor, Repo};

use reqwest::blocking::Client;

pub fn get_apps(apps: Vec<String>, client: Client, commit_id: String) -> Vec<App> {
    let mut app_list = vec![];

    for app in apps {
        let url = GITHACK
            .replace("[sha]", commit_id.as_str())
            .replace("[file]", format!("{}.json", app.clone()).as_str());

        if let Ok(resp) = client.get(url).send() {
            if let Ok(gh_app) = resp.json::<GithubApp>() {
                app_list.push(App {
                    id: app.clone(),
                    app: gh_app,
                });
            } else {
                fill_default(&mut app_list);
            }
        } else {
            fill_default(&mut app_list);
        }
    }

    app_list
}

fn fill_default(app_list: &mut Vec<App>) {
    let string = String::from("NON_EXISTENT");

    app_list.push(App {
        id: string.clone(),
        app: GithubApp {
            api: string.clone(),
            appFinder: string.clone(),
            author: RawAuthor { id: string.clone() },
            description: string.clone(),
            download_url: string.clone(),
            exe: string.clone(),
            img: string.clone(),
            repo: Repo {
                author: string.clone(),
                location: string.clone(),
            },
            title: string.clone(),
            version: string.clone(),
        },
    });
}
