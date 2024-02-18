use std::{fs, io::Write};

use reqwest::blocking::Client;

pub fn download<T: FnMut(f32)>(client: &mut Client, url: &str, path: &str, mut call: T) {
  let _ = fs::remove_file(&path);

  let response = client.get(url).send().unwrap().bytes().unwrap();

  let mut c = 0;
  let t = response.len();

  let mut file = vec![];

  let mut last = 0;

  for chunk in response.chunks(2048) {
    c += chunk.len();

    if last != (c / t) {
      last = c / t;
      call(c as f32 / t as f32);
    }

    file.write_all(&chunk).unwrap();
  }

  fs::write(path, file).unwrap();
}
