use bcrypt::verify;
use crypter::encrypt as crypt;
use serde_json::to_string;

pub fn verify_pwd(pwd: &str) -> bool {
    let hash: &str = include!("./hash");

    return verify(&pwd.clone(), &hash.clone()).unwrap_or(false);
}

pub fn encrypt(data: String) -> Option<String> {
    let pass: &str = include!("./encrypt");

    if let Some(data) = crypt(pass.as_bytes(), data.as_bytes()) {
        if let Ok(data) = to_string(&data) {
            return Some(data);
        } else {
            return None;
        }
    }
    None
}
