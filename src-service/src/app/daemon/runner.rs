use std::{
    sync::mpsc::{Receiver, Sender, TryRecvError},
    thread::spawn,
};

use threadpool::ThreadPool;
use reqwest::blocking::Client;

use super::app_manager;

#[derive(Clone)]
enum Order {
    FetchApps(Vec<String>, String),
    InstallApps(Vec<String>, String),
    UninstallApps(Vec<String>, String),
    GetUpdateStats(String),
    RunUpdateCheck(String),
    Stop(),
}

pub fn run(tx: Sender<String>, rx: Receiver<String>, client: Client) {spawn(move || {
    let mut queue: Vec<Order> = vec![];
    let pool = ThreadPool::new(20);

    loop {
        check_rx(&rx, &mut queue);

        let cloned_queue = queue.clone();

        let should_exit = cloned_queue.iter().find(|e| match e {
            &&Order::Stop() => true,          
            _ => false
        }).is_some();

        if should_exit {
            tx.send("OK".to_owned()).unwrap_or(());
            break;
        }

        for order in cloned_queue {
            let tx = tx.clone();
            let order = order.clone();
            let client = client.clone();

            pool.execute(move || {
                execute_order(tx, order, client);
            });
        }
        pool.join();

        queue = vec![];
    }
});}

fn execute_order(tx: Sender<String>, order: Order, client: Client) {
    match &order {
        _ => {}
    }
}

fn check_rx(rx: &Receiver<String>, queue: &mut Vec<Order>) {
    let resp = rx.try_recv();
    if let Ok(order) = resp.clone() {
        let collected = order.split("ā").map(|x| x.to_string()).collect::<Vec<String>>();

        let first = collected[0].clone();
        let second = collected[1].clone();

        let main_order = order.clone();

        let (order, payload) = (first.as_str(), second.as_str());

        match order {
            "APP" => {
                let apps = payload.to_string().split("‱").map(|x| x.to_string()).collect();

                queue.push(
                    Order::FetchApps(
                        apps,
                        main_order.clone()
                    )
                );
            }
            "INSTALL" => {
                let apps = payload.to_string().split("‱").map(|x| x.to_string()).collect();

                queue.push(
                    Order::InstallApps(
                        apps,
                        main_order.clone()
                    )
                );
            }
            "UNINSTALL" => {
                let apps = payload.to_string().split("‱").map(|x| x.to_string()).collect();

                queue.push(
                    Order::UninstallApps(
                        apps,
                        main_order.clone()
                    )
                );
            }
            "UPDATE" => {
                queue.push(Order::GetUpdateStats(main_order.clone()));
            }
            "CHECKUPDATE" => {
                queue.push(Order::RunUpdateCheck(main_order.clone()));
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
            },
            _ => {}
        }
    }
}