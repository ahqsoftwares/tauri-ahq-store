use std::thread;
use std::collections::HashMap;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

struct CacheEntry {
    pub data: String,
    pub last_accessed: u64,
}

struct CacheEntryVec {
    pub data: Vec<u8>,
    pub last_accessed: u64,
}

static mut PURGING: bool = false;
static mut ENCRYPTED: Option<HashMap<String, CacheEntryVec>> = None;
static mut DECRYPTED: Option<HashMap<String, CacheEntry>> = None;

pub fn get_encrypted(key: String) -> Option<Vec<u8>> {
    let purging = unsafe { PURGING };

    if purging {
        return None;
    }

    let encrypted = unsafe { ENCRYPTED.as_ref() };
    if let Some(encrypted) = encrypted {
        let resp = encrypted.get(&key).map(|e| e.data.clone());

        if let &Some(_) = &resp {
            unsafe {update_time(key, false)};
        }

        return resp;
    } else {
        unsafe {init();}
    }

    None
}

pub fn set_encrypted(key: String, data: Vec<u8>) {
    let purging = unsafe { PURGING };

    if purging {
        return;
    }

    let encrypted = unsafe { ENCRYPTED.as_mut() };
    if let None = encrypted {
        unsafe {init();}
    }

    encrypted.unwrap().insert(key, CacheEntryVec {
        data,
        last_accessed: now()
    });
}

pub fn get_decrypted(key: String) -> Option<String> {
    let purging = unsafe { PURGING };

    if purging {
        return None;
    }

    let decrypted = unsafe { DECRYPTED.as_ref() };
    if let Some(decrypted) = decrypted {
        let resp = decrypted.get(&key).map(|e| e.data.clone());

        if let &Some(_) = &resp {
            unsafe {update_time(key, true)};
        }

        return resp;
    } else {
        unsafe {init();}
    }

    None
}

pub fn set_decrypted(key: String, data: String) {
    let purging = unsafe { PURGING };

    if purging {
        return;
    }

    let decrypted = unsafe { DECRYPTED.as_mut() };

    if let None = decrypted {
        unsafe {init();}
    }

    decrypted.unwrap().insert(key, CacheEntry {
        data,
        last_accessed: now()
    });
}

unsafe fn update_time(key: String, decrypted: bool) {
    if decrypted {
        let data = DECRYPTED.as_mut().unwrap();
        
        if let Some(x) = data.get_mut(&key) {
            x.last_accessed = now();
        }
    } else {
        let data = ENCRYPTED.as_mut().unwrap();

        if let Some(x) = data.get_mut(&key) {
            x.last_accessed = now();
        }
    }
}

unsafe fn init() {
    ENCRYPTED = Some(HashMap::new());
    DECRYPTED = Some(HashMap::new());

    thread::spawn(|| {
        loop {
            PURGING = true;

            let rn = now();

            let encrypted = ENCRYPTED.as_ref().unwrap();
            let encrypted_mut = ENCRYPTED.as_mut().unwrap();

            encrypted.iter().for_each(|x| {
                let should_delete = rn - x.1.last_accessed > 5 * 60;

                if should_delete {
                    encrypted_mut.remove(x.0);
                }
            });

            let decrypted = DECRYPTED.as_ref().unwrap();
            let decrypted_mut = DECRYPTED.as_mut().unwrap();

            decrypted.iter().for_each(|x| {
                let should_delete = rn - x.1.last_accessed > 5 * 60;

                if should_delete {
                    decrypted_mut.remove(x.0);
                }
            });

            PURGING = false;
            thread::sleep(Duration::from_secs(120));
        }
    });
}

fn now() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs()
}