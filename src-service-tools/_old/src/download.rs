use std::fs::create_dir_all;

use downloader::Downloader;

pub fn download(path: &str, url: &str) {
    let url = url.clone();
    let path = path.clone();

    create_dir_all(&path).unwrap_or(());

    let mut downloader = Downloader::builder()
        .download_folder(std::path::Path::new(path))
        .parallel_requests(1)
        .build()
        .unwrap();

    let dl = downloader::Download::new(url);

    let result = downloader.download(&[dl]).unwrap();

    for r in result {
        match r {
            Err(e) => println!("Error: {}", e.to_string()),
            Ok(s) => println!("Success: {}", &s),
        };
    }
}
