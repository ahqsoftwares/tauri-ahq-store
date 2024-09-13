use std::{fs, io::Write};

use reqwest::Client;

pub async fn download<T: FnMut(f32)>(client: &mut Client, url: &str, path: &str, mut call: T) {
  let _ = fs::remove_file(&path);

  println!("Path: {}", &url);
  let mut response = client.get(url).send().await.unwrap();

  let mut c = 0;
  let t = (response.content_length().unwrap_or(10000)) as u64;

  let mut file = vec![];

  let mut last = 0.0;

  while let Some(chunk) = response.chunk().await.unwrap() {
    c += chunk.len();

    if last != (c as f32 / t as f32) {
      last = c as f32 / t as f32;
      call(c as f32 / t as f32);
    }

    file.write_all(&chunk.to_vec()).unwrap();
  }

  fs::write(path, file).unwrap();
}
