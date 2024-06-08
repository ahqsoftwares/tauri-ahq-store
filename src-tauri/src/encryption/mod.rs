mod cache;

use cache::*;

use bcrypt::{hash_with_salt, Version, DEFAULT_COST};
use chacha20poly1305::{
  aead::{generic_array::GenericArray, Aead, KeyInit},
  ChaCha20Poly1305,
};
use lazy_static::lazy_static;

lazy_static! {
  static ref CRYPTER: ChaCha20Poly1305 = {
    let key = GenericArray::from_slice(
      include!(concat!(env!("CARGO_MANIFEST_DIR"), "/src/encrypt")).as_bytes(),
    );
    ChaCha20Poly1305::new(&key)
  };
}

static SALT: [u8; 16] = [
  0x14, 0x4b, 0x3d, 0x69, 0x1a, 0x7b, 0x4e, 0xcf, 0x39, 0xcf, 0x73, 0x5c, 0x7f, 0xa7, 0xa7, 0x9c,
];

use serde_json::to_string;

#[tauri::command(async)]
pub fn to_hash_uid(id: String) -> Option<String> {
  Some(
    hash_with_salt(&id, DEFAULT_COST, SALT)
      .ok()?
      .format_for_version(Version::TwoB)
      .replace(".", "0")
      .replace("/", "1")
      .replace("$", "2"),
  )
}

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
pub fn decrypt(encrypted: Vec<u8>) -> Option<String> {
  let nonce = GenericArray::from_slice(b"SSSSSSSSSSSS");

  let en_txt = to_string(&encrypted).ok()?;

  if let Some(x) = get_decrypted(en_txt.clone()) {
    return Some(x);
  }

  let decrypted = CRYPTER.decrypt(nonce, &*encrypted).ok()?;

  let string = String::from_utf8(decrypted);

  if let Err(x) = string {
    println!("{:#?}", x);
    return None;
  } else {
    let string = string.unwrap();

    set_decrypted(en_txt, string.clone());

    return Some(string);
  }
}
