mod cache;

use crypter::{decrypt as d_crypt, encrypt as crypt};

use serde_json::{from_str, to_string};

use cache::*;

pub fn encrypt(data: String) -> Option<String> {
    let pass: &str = include!("./encrypt");

    if let Some(x) = get_encrypted(data.clone()) {
        return Some(x);
    } else if let Some(dat) = crypt(pass.as_bytes(), data.as_bytes()) {
        if let Ok(dat) = to_string(&dat) {
            set_encrypted(data, dat.clone());
            return Some(dat);
        }
    }
    None
}

pub fn decrypt(data: String) -> Option<String> {
    let pass: &str = include!("./encrypt");

    if let Some(x) = get_decrypted(data.clone()) {
        return Some(x);
    } else if let Ok(x) = from_str::<Vec<u8>>(&data) {
        if let Some(dat) = d_crypt(pass.as_bytes(), &x) {
            if let Ok(dat) = String::from_utf8(dat) {
                set_decrypted(data, dat.clone());
                return Some(dat);
            }
        }
    }
    None
}
