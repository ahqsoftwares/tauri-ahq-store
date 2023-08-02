mod cache;

use cache::*;

use crypter;

use serde_json::to_string;

#[tauri::command(async)]
pub fn encrypt(payload: String) -> Option<Vec<u8>> {
    let pass = include!(concat!(env!("CARGO_MANIFEST_DIR"), "/src/encrypt"));

    if let Some(x) = get_encrypted(payload.clone()) {
        return Some(x);
    } else {
        let data = crypter::encrypt(pass.as_bytes(), payload.as_bytes());

        if let Some(data) = &data {
            set_encrypted(payload, data.clone());
        }

        return data;
    }
}

#[tauri::command(async)]
pub fn decrypt(encrypted: Vec<u8>) -> Option<String> {
    let pass = include!(concat!(env!("CARGO_MANIFEST_DIR"), "/src/encrypt"));

    let en_txt = to_string(&encrypted).unwrap();

    if let Some(x) = get_decrypted(en_txt.clone()) {
        return Some(x);
    }

    let decrypted = crypter::decrypt(pass.as_bytes(), &encrypted)?;

    let string = String::from_utf8(decrypted);

    if &string.is_err() == &true {
        return None;
    } else {
        let string = string.unwrap();

        set_decrypted(en_txt, string.clone());

        return Some(string);
    }
}
