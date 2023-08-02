use crate::app::daemon::{
    app_manager::GITHACK,
    runner::{get_cache, set_cache},
};

use super::{App, GithubApp, Repo};

use reqwest::blocking::Client;
use serde_json::{from_str, to_string};

pub fn get_apps(apps: Vec<String>, client: Client, commit_id: String) -> Vec<App> {
    let mut app_list = vec![];

    for app in apps {
        let url = GITHACK
            .replace("[sha]", commit_id.as_str())
            .replace("[file]", format!("app_{}.json", app.clone()).as_str());

        if let Some(cache) = get_cache(app.clone()) {
            if let Ok(x) = from_str(&cache) {
                app_list.push(App {
                    app: x,
                    id: app.clone(),
                });
            } else {
                fill_default(&mut app_list);
            }
        } else if let Ok(resp) = client.get(url).send() {
            if let Ok(gh_app) = resp.json::<GithubApp>() {
                if let Ok(x) = to_string(&gh_app) {
                    if let None = set_cache(app.clone(), x) {
                        #[cfg(debug_assertions)]
                        println!("WARN: Error adding into Cache");
                    }
                }

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
            author: string.clone(),
            description: string.clone(),
            download: string.clone(),
            exe: string.clone(),
            icon: string.clone(),
            repo: Repo {
                author: string.clone(),
                repo: string.clone(),
            },
            title: string.clone(),
            displayName: string.clone(),
            version: string.clone(),
        },
    });
}
