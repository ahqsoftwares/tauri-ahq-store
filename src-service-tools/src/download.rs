use std::fs::create_dir_all;

use downloader::{progress::Reporter, Downloader};

struct SimpleReporter;

static mut BYTES: u64 = 1;

impl SimpleReporter {
    fn create() -> std::sync::Arc<Self> {
        std::sync::Arc::new(Self)
    }
}

impl Reporter for SimpleReporter {
    fn setup(&self, max_progress: Option<u64>, _: &str) {
        unsafe {
            BYTES = max_progress.unwrap_or(1);
        }
    }

    fn done(&self) {
        #[cfg(debug_assertions)]
println!("Downloading Finished Successfully!");
    }

    fn progress(&self, c: u64) {
        unsafe {
            let perc = c * 100 / BYTES;

            #[cfg(debug_assertions)]
println!("Downloading: {}% of {} bytes", perc, BYTES);
        }
    }

    fn set_message(&self, _: &str) {}
}

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

    let dl = dl.progress(SimpleReporter::create());

    let result = downloader.download(&[dl]).unwrap();

    for r in result {
        match r {
            Err(e) => #[cfg(debug_assertions)]
println!("Error: {:#?}", e),
            Ok(s) => #[cfg(debug_assertions)]
println!("Success: {}", &s),
        };
    }
}
