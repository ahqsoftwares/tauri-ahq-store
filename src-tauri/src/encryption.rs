use crypter;

#[tauri::command(async)]
pub fn encrypt(payload: String) -> Option<Vec<u8>> {
    let pass = include!("./encrypt");

    crypter::encrypt(pass.as_bytes(), payload.as_bytes())
}

#[tauri::command(async)]
pub fn decrypt(encrypted: Vec<u8>) -> Option<String> {
    let pass = include!("./encrypt");
    
    let decrypted = crypter::decrypt(pass.as_bytes(), &encrypted)?;

    let string = String::from_utf8(decrypted);

    if &string.is_err() == &true {
        return None;
    } else {
        return Some(string.unwrap());
    }
}