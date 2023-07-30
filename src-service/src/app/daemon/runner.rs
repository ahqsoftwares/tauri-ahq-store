use reqwest::blocking::Client;
use serde_json::{from_str, to_string};
use std::{
    collections::HashMap,
    sync::mpsc::{Receiver, Sender, TryRecvError},
    thread::spawn,
    time::{Duration, SystemTime},
};
use threadpool::ThreadPool;

use super::{
    app_manager::{check_for_updates, get_apps, install_apps, list_apps, uninstall},
    get_commit,
    preferences::{get_prefs, update_prefs},
    Preferences,
};

#[derive(Clone)]
enum Order {
    FetchApps(Vec<String>, String),
    InstallApps(Vec<String>, String),
    UninstallApps(Vec<String>, String),
    GetUpdateStats(String),
    RunUpdateCheck(String),
    ListApps(String),
    Commit(String),
    GetPrefs(String),
    PostPrefs(String, String),
    Stop(),
}

const ID: &str = "ā";
static mut CACHE: Option<HashMap<String, String>> = None;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum Status {
    Initial,
    Checking,
    UpToDate,
    Updating,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UpdateStatus {
    pub status: Status,
    pub updating: Vec<String>,
}

pub fn run(tx: Sender<String>, rx: Receiver<String>, client: Client) {
    init_cache();
    spawn(move || {
        let mut queue: Vec<Order> = vec![];

        let get_time = |old_sys| {
            SystemTime::now()
                .duration_since(old_sys)
                .unwrap_or(Duration::from_micros(0))
                .as_secs()
        };

        let mut last_time = SystemTime::now();
        let mut commit_id = get_commit(0);

        let mut update_status = UpdateStatus {
            status: Status::Initial,
            updating: vec![],
        };

        let pool = ThreadPool::new(30);

        loop {
            for _ in 0..20 {
                check_rx(&rx, &mut queue);
            }

            let cloned_queue = queue.clone();

            let should_exit = cloned_queue
                .iter()
                .find(|e| match e {
                    &&Order::Stop() => true,
                    _ => false,
                })
                .is_some();

            if should_exit {
                tx.send("OK".to_owned()).unwrap_or(());
                break;
            }

            let difference = get_time(last_time.clone());

            if difference > 60 * 60 {
                commit_id = get_commit(0);
                last_time = SystemTime::now();
                init_cache();

                check_for_updates(
                    client.clone(),
                    commit_id.clone(),
                    tx.clone(),
                    &mut update_status,
                    &|_, _| {},
                );
            }

            for order in cloned_queue {
                match order {
                    Order::FetchApps(_, _) => {
                        let tx = tx.clone();
                        let order = order.clone();
                        let client = client.clone();
                        let commit = commit_id.clone();
                        let status = update_status.clone();

                        pool.execute(move || {
                            execute_order(tx, order, commit, status, client);
                        });
                    }
                    Order::RunUpdateCheck(ref_id) => {
                        pool.join();

                        check_for_updates(
                            client.clone(),
                            commit_id.clone(),
                            tx.clone(),
                            &mut update_status,
                            &|status, tx| {
                                tx.send(format!(
                                    "UPDATE{}{ref_id}{}{}",
                                    ID,
                                    ID,
                                    to_string(&status).unwrap_or("{{}}".to_string())
                                ))
                                .unwrap_or(())
                            },
                        );

                        terminate(&tx, &&ref_id);
                    }
                    Order::Commit(ref_id) => {
                        tx.send(format!("COMMIT{}{ref_id}{}{}", ID, ID, &commit_id))
                            .unwrap_or(());

                        terminate(&tx, &&ref_id);
                    }
                    _ => {
                        let tx = tx.clone();
                        let order = order.clone();
                        let client = client.clone();
                        let commit = commit_id.clone();
                        let status = update_status.clone();

                        let mut join = false;

                        if let &Order::InstallApps(..) = &order {
                            pool.join();
                            join = true;
                        }

                        pool.execute(move || {
                            execute_order(tx, order, commit, status, client);
                        });

                        if join {
                            pool.join();
                        }
                    }
                }
            }

            queue = vec![];

            std::thread::sleep(Duration::from_secs(3));
        }
    });
}

fn execute_order(
    tx: Sender<String>,
    order: Order,
    commit_id: String,
    update_status: UpdateStatus,
    client: Client,
) {
    match &order {
        Order::FetchApps(apps, ref_id) => {
            let apps = get_apps(apps.clone(), client, commit_id);

            tx.send(format!(
                "APP{}{}{}{}",
                ID,
                ref_id,
                ID,
                to_string(&apps).unwrap_or("[]".to_string())
            ))
            .unwrap_or(());

            terminate(&tx, &ref_id);
        }
        Order::InstallApps(apps, ref_id) => {
            let unsuccessful = install_apps(
                apps.clone(),
                commit_id.clone(),
                client.clone(),
                &tx,
                &ref_id,
            );

            tx.send(format!(
                "INSTALLAPP{}{}{}{}",
                ID,
                ref_id,
                ID,
                to_string(&unsuccessful).unwrap_or("[]".to_string())
            ))
            .unwrap_or(());

            terminate(&tx, &ref_id);
        }
        Order::UninstallApps(apps, ref_id) => {
            let unsuccessful = uninstall(apps.clone(), commit_id.clone(), client.clone());

            tx.send(format!(
                "UNINSTALLAPP{}{}{}{}",
                ID,
                ref_id,
                ID,
                to_string(&unsuccessful).unwrap_or("[]".to_string())
            ))
            .unwrap_or(());

            terminate(&tx, &ref_id);
        }
        Order::GetUpdateStats(ref_id) => {
            tx.send(format!(
                "GET-UPDATE{}{}{}{}",
                ID,
                ref_id,
                ID,
                to_string(&update_status).unwrap_or("[]".to_string())
            ))
            .unwrap_or(());

            terminate(&tx, &ref_id);
        }
        Order::ListApps(ref_id) => {
            let apps = list_apps();

            tx.send(format!(
                "LISTAPPS{}{}{}{}",
                ID,
                ref_id,
                ID,
                to_string(&apps).unwrap_or("[]".to_string())
            ))
            .unwrap_or(());

            terminate(&tx, &ref_id);
        }
        Order::GetPrefs(ref_id) => {
            tx.send(format!(
                "GET_PREFS{}{}{}{}",
                ID,
                ref_id,
                ID,
                to_string(&get_prefs()).unwrap()
            ))
            .unwrap_or(());

            terminate(&tx, &ref_id);
        }
        Order::PostPrefs(new_prefs, ref_id) => {
            update_prefs(Preferences::Data(new_prefs.clone()));

            tx.send(format!("POST_PREFS{}{}{}{}", ID, ref_id, ID, ""))
                .unwrap_or(());

            terminate(&tx, &ref_id);
        }
        _ => {}
    }
}

fn terminate(tx: &Sender<String>, ref_id: &&String) {
    tx.send(format!("TERMINATE{}{}{}{}", ID, ref_id, ID, ""))
        .unwrap_or(());
}

fn check_rx(rx: &Receiver<String>, queue: &mut Vec<Order>) {
    let resp = rx.try_recv();
    if let Ok(order) = resp.clone() {
        let collected = order
            .split(ID)
            .map(|x| x.to_string())
            .collect::<Vec<String>>();

        let ref_id = collected[0].clone();
        let first = collected[1].clone();
        let second = collected[2].clone();

        let (ref_id, order, payload) = (ref_id, first.as_str(), second.as_str());

        match order {
            "APP" => {
                let apps = from_str(payload.to_string().as_str()).unwrap_or(vec![]);

                queue.push(Order::FetchApps(apps, ref_id));
            }
            "INSTALL" => {
                let apps = from_str(payload.to_string().as_str()).unwrap_or(vec![]);

                queue.push(Order::InstallApps(apps, ref_id));
            }
            "UNINSTALL" => {
                let apps = from_str(payload.to_string().as_str()).unwrap_or(vec![]);

                queue.push(Order::UninstallApps(apps, ref_id));
            }
            "UPDATE" => {
                queue.push(Order::GetUpdateStats(ref_id));
            }
            "CHECKUPDATE" => {
                queue.push(Order::RunUpdateCheck(ref_id));
            }
            "LISTAPPS" => {
                queue.push(Order::ListApps(ref_id));
            }
            "COMMIT" => {
                queue.push(Order::Commit(ref_id));
            }
            "STOP" => {
                queue.push(Order::Stop());
            }
            "GET_PREFS" => {
                queue.push(Order::GetPrefs(ref_id));
            }
            "POST_PREFS" => {
                queue.push(Order::PostPrefs(payload.into(), ref_id));
            }
            _ => {}
        }
    } else if let Err(e) = resp {
        match e {
            TryRecvError::Disconnected => {
                panic!("Err");
            }
            _ => {}
        }
    }
}

fn init_cache() {
    unsafe {
        CACHE = Some(HashMap::new());
    }
}

pub fn get_cache(key: String) -> Option<&'static String> {
    unsafe {
        if let Some(cache) = CACHE.as_ref() {
            return cache.get(&key);
        }
    }
    None
}

pub fn set_cache(key: String, value: String) -> Option<()> {
    unsafe {
        CACHE.as_mut()?.insert(key, value);
    }
    None
}
