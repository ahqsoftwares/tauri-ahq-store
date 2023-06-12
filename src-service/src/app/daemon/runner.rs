use std::{
    sync::mpsc::{Receiver, Sender, TryRecvError},
    thread::spawn,
    time::{Duration, SystemTime},
};

use reqwest::blocking::Client;
use serde_json::{from_str, to_string};

use super::{
    app_manager::{check_for_updates, get_apps, install_apps, list_apps},
    get_commit,
};

#[derive(Clone)]
enum Order {
    FetchApps(Vec<String>, String),
    InstallApps(Vec<String>, String),
    UninstallApps(Vec<String>, String),
    GetUpdateStats(String),
    RunUpdateCheck(String),
    ListApps(String),
    Stop(),
}

const ID: &str = "ā";

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
                    Order::RunUpdateCheck(ref_id) => {
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
                    }
                    _ => {
                        let tx = tx.clone();
                        let order = order.clone();
                        let client = client.clone();
                        let commit = commit_id.clone();
                        let status = update_status.clone();

                        execute_order(tx, order, commit, status, client);
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
        }
        Order::InstallApps(apps, ref_id) => {
            let unsuccessful = install_apps(apps.clone(), commit_id.clone(), client.clone());

            tx.send(format!(
                "INSTALLAPP{}{}{}{}",
                ID,
                ref_id,
                ID,
                to_string(&unsuccessful).unwrap_or("[]".to_string())
            ))
            .unwrap_or(());
        }
        Order::UninstallApps(_apps, _ref_id) => {}
        Order::GetUpdateStats(ref_id) => {
            tx.send(format!(
                "GET-UPDATE{}{}{}{}",
                ID,
                ref_id,
                ID,
                to_string(&update_status).unwrap_or("[]".to_string())
            ))
            .unwrap_or(());
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
        }
        _ => {}
    }
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

                queue.push(Order::FetchApps(apps, ref_id.clone()));
            }
            "INSTALL" => {
                let apps = from_str(payload.to_string().as_str()).unwrap_or(vec![]);

                queue.push(Order::InstallApps(apps, ref_id.clone()));
            }
            "UNINSTALL" => {
                let apps = from_str(payload.to_string().as_str()).unwrap_or(vec![]);

                queue.push(Order::UninstallApps(apps, ref_id.clone()));
            }
            "UPDATE" => {
                queue.push(Order::GetUpdateStats(ref_id.clone()));
            }
            "CHECKUPDATE" => {
                queue.push(Order::RunUpdateCheck(ref_id.clone()));
            }
            "LISTAPPS" => {
                queue.push(Order::ListApps(ref_id.clone()));
            }
            "STOP" => {
                queue.push(Order::Stop());
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
