use std::{
  collections::HashMap,
  io::{Read, Write},
  sync::{Arc, Mutex},
  thread,
};

use lazy_static::lazy_static;

use super::utils::{log, now, sleep, warn};

mod worker;

lazy_static! {
  static ref CONNECTIONS: Arc<Mutex<HashMap<u64, LocalSocketStream>>> =
    Arc::new(HashMap::new().into());
}

static mut DAEMON_RUNNING: bool = false;
static mut CUR_VAL: u64 = 0;

fn start_daemon() {
  thread::spawn(|| {
    unsafe { DAEMON_RUNNING = true };
    log("Daemon Started Running");

    let mut heartbeats: HashMap<u64, u64> = HashMap::new();

    #[allow(unused_assignments)]
    let mut tried: u64 = 0;

    let (tx, rx) = worker::establish_worker();

    loop {
      let connections = CONNECTIONS.clone();

      if let Ok(mut conn) = connections.try_lock() {
        let values: Vec<(u64, String)> = conn
          .iter_mut()
          .map(|(id, reader)| {
            let mut read_value = String::new();

            let _ = reader.read_to_string(&mut read_value);

            if &read_value == "" {
              let _ = heartbeats.insert(*id, now());
            }

            (*id, read_value)
          })
          .filter(|(_, f)| f != "")
          .collect();

        // Unlock the Mutex
        drop(conn);

        tried = 0;

        let _ = tx.send(values);

        //Do Actions based on data
        let resp: Vec<(u64, String)> = vec![];

        // Acquire Mutex
        'a: loop {
          if let Ok(mut conn) = CONNECTIONS.try_lock() {
            for (key, data) in resp {
              if let Some(x) = conn.get_mut(&key) {
                let _ = x.write_all(data.as_bytes());
                let _ = x.flush();
              }
            }

            for (key, data) in heartbeats.iter() {
              if data > &30 {
                let _ = conn.remove(&key);
              }
            }

            drop(conn);
            break 'a;
          } else {
            tried += 1;

            if tried >= 80000 {
              panic!("UNABLE TO ACQUIRE MUTEX");
            }

            sleep(Some(1));
          }
        }
      }

      sleep(Some(20));
    }
  });
}

pub fn accept(stream: LocalSocketStream, turns: u8) -> Option<()> {
  if !unsafe { DAEMON_RUNNING } {
    start_daemon();
  }

  if turns == 0 {
    stream.set_nonblocking(true).ok()?;
  }

  if let Ok(mut conn) = CONNECTIONS.try_lock() {
    let num = unsafe {
      CUR_VAL += 1;
      CUR_VAL
    };
    conn.insert(num, stream);
    Some(())
  } else {
    if turns > 200 {
      return None;
    }
    warn("Relaunching");

    sleep(Some(1));
    accept(stream, turns + 1)
  }
}
