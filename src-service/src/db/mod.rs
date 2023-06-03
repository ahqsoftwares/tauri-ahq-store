use std::collections::HashMap;

static mut DATABASE: Option<HashMap<String, String>> = None;

pub fn main() {
    let new_db: HashMap<String, String> = HashMap::new();

    unsafe {
        DATABASE = Some(new_db);
    }
}

pub fn get(key: String) -> Option<String> {
    unsafe {
        let db = DATABASE.clone();

        if let Some(db) = db {
            return db.clone().get(&key).map(|x| x.clone());
        } else {
            return None;
        }
    }
}

pub fn set(k: String, v: String) {
    unsafe {
        let mut db = DATABASE.clone().unwrap_or(HashMap::new());

        match db.insert(k, v) {
            _ => {}
        };

        DATABASE = Some(db);
    }
}

pub fn remove(key: String) {
    unsafe {
        let mut db = DATABASE.clone().unwrap_or(HashMap::new());

        match db.remove(&key) {
            _ => {}
        };

        DATABASE = Some(db);
    }
}
