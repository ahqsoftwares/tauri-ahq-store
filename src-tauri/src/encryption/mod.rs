mod cache;

use cache::*;

use lazy_static::lazy_static;

use chacha20poly1305::{
    aead::{KeyInit, generic_array::GenericArray, Aead},
    ChaCha20Poly1305,
};

lazy_static! {
    static ref CRYPTER: ChaCha20Poly1305 = {
        let key = GenericArray::from_slice(
            include!(concat!(env!("CARGO_MANIFEST_DIR"), "/src/encrypt")).as_bytes()
        );
        ChaCha20Poly1305::new(&key)
    };
}

use serde_json::to_string;

#[tauri::command(async)]
pub fn encrypt(payload: String) -> Option<Vec<u8>> {
    let nonce = GenericArray::from_slice(b"SSSSSSSSSSSS");

    if let Some(x) = get_encrypted(payload.clone()) {
        return Some(x);
    } else {
        let data = CRYPTER.encrypt(nonce, payload.as_bytes());

        if let Ok(data) = &data {
            set_encrypted(payload, data.clone());
        }

        return data.ok();
    }
}

#[tauri::command(async)]
pub fn decrypt(encrypted: &[u8]) -> Option<String> {
    let nonce = GenericArray::from_slice(b"SSSSSSSSSSSS");

    let en_txt = to_string(&encrypted).unwrap();

    if let Some(x) = get_decrypted(en_txt.clone()) {
        return Some(x);
    }

    let decrypted = CRYPTER.decrypt(nonce, encrypted).ok()?;

    let string = String::from_utf8(decrypted);

    if &string.is_err() == &true {
        return None;
    } else {
        let string = string.unwrap();

        set_decrypted(en_txt, string.clone());

        return Some(string);
    }
}
