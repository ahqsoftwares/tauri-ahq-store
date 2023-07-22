use bcrypt::verify;

use crypter::{
    encrypt as crypt,
    decrypt as d_crypt
};

use serde_json::{
    from_str,
    to_string
};

pub fn verify_pwd(pwd: &str) -> bool {
    let hash: &str = include!("./hash");

    return verify(&pwd.clone(), &hash.clone()).unwrap_or(false);
}

pub fn encrypt(data: String) -> Option<String> {
    let pass: &str = include!("./encrypt");

    if let Some(data) = crypt(pass.as_bytes(), data.as_bytes()) {
        if let Ok(data) = to_string(&data) {
            return Some(data);
        }
    }
    None
}

pub fn decrypt(data: String) -> Option<String> {
    let pass: &str = include!("./encrypt");

    if let Ok(x) = from_str(&data) {
        if let Some(data) = d_crypt(pass.as_bytes(), x) {
            if let Ok(data) = String::from_utf8(data) {
                return Some(data);
            }
        }
    }
    None
}