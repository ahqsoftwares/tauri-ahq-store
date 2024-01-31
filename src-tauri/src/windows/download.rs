use crate::windows::utils::CLIENT;

use std::{
  fs::{create_dir_all, File},
  io::Write,
};

pub fn download(url: &str, path: &str, file: &str, logger: fn(u64, u64) -> ()) -> u8 {
  let datas = create_dir_all(path);
  match datas {
    Err(_daras) => {
      #[cfg(debug_assertions)]
      println!("{}", _daras.to_string())
    }
    Ok(()) => {
      #[cfg(debug_assertions)]
      println!("Created Dir for files")
    }
  };

  (|| {
    let mut file = File::create(format!("{}/{}", &path, &file)).ok()?;

    let bytes = CLIENT.get(url).send().ok()?.bytes().ok()?;

    let total = bytes.len() as u64;

    let mut written = 0 as u64;

    for byte in bytes.chunks(20000) {
      written += byte.len() as u64;
      file.write(byte).ok()?;

      logger(written, total);
    }

    file.flush().ok()
  })()
  .map_or_else(|| 1, |_| 0)
}
