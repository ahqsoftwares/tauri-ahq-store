mod cache;

use lazy_static::lazy_static;

use chacha20poly1305::{
    aead::{KeyInit, generic_array::GenericArray, Aead},
    ChaCha20Poly1305,
};

use serde_json::{from_str, to_string};

use cache::*;

lazy_static! {
    static ref CRYPTER: ChaCha20Poly1305 = {
        let key = GenericArray::from_slice(include!("./encrypt").as_bytes());
        ChaCha20Poly1305::new(&key)
    };

    static ref CRYPTER2: ChaCha20Poly1305 = {
        let key = GenericArray::from_slice(include!("./encrypt_2").as_bytes());
        ChaCha20Poly1305::new(&key)
    };
}

pub fn encrypt(data: String) -> Option<String> {
    let nonce = GenericArray::from_slice(b"SSSSSSSSSSSS");

    if let Some(x) = get_encrypted(data.clone()) {
        return Some(x);
    } else if let Ok(dat) = CRYPTER.encrypt(nonce, data.as_bytes()) {
        if let Ok(dat) = to_string(&dat) {
            set_encrypted(data, dat.clone());
            return Some(dat);
        }
    }
    None
}

pub fn encrypt2(data: String) -> Option<String> {
    let nonce = GenericArray::from_slice(b"SSSSSSSSSSSS");

    if let Ok(dat) = CRYPTER2.encrypt(nonce, data.as_bytes()) {
        return to_string(&dat).ok()
    }
    None
}

pub fn decrypt(data: String) -> Option<String> {
    let nonce = GenericArray::from_slice(b"SSSSSSSSSSSS");

    if let Some(x) = get_decrypted(data.clone()) {
        return Some(x);
    } else if let Ok(x) = from_str::<Vec<u8>>(&data) {
        if let Ok(dat) = CRYPTER.decrypt(nonce, x.as_slice()) {
            if let Ok(dat) = String::from_utf8(dat) {
                set_decrypted(data, dat.clone());
                return Some(dat);
            }
        }
    }
    None
}

pub fn decrypt2(data: String) -> Option<String> {
    let nonce = GenericArray::from_slice(b"SSSSSSSSSSSS");

    if let Ok(x) = from_str::<Vec<u8>>(&data) {
        if let Ok(dat) = CRYPTER2.decrypt(nonce, x.as_slice()) {
            return String::from_utf8(dat).ok()
        }
    }
    None
}