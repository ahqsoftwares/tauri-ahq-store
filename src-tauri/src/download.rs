// Setup warnings/errors:
#![forbid(unsafe_code)]
#![deny(bare_trait_objects, unused_doc_comments, unused_import_braces)]
// Clippy:
#![warn(clippy::all, clippy::nursery, clippy::pedantic)]
#![allow(clippy::non_ascii_literal)]
use winapi_easy::ui::{Window, Taskbar, ProgressState};
use downloader::Downloader;
use std::fs::create_dir_all;
use std::path::Path;

// Define a custom progress reporter:
struct SimpleReporterPrivate {
    last_update: std::time::Instant,
    max_progress: Option<u64>,
    message: String,
}
struct SimpleReporter {
    private: std::sync::Mutex<Option<SimpleReporterPrivate>>,
}

impl SimpleReporter {
    #[cfg(not(feature = "tui"))]
    fn create() -> std::sync::Arc<Self> {
        std::sync::Arc::new(Self {
            private: std::sync::Mutex::new(None)
        })
    }
}

impl downloader::progress::Reporter for SimpleReporter {
    fn setup(&self, max_progress: Option<u64>, message: &str) {
        let private = SimpleReporterPrivate {
            last_update: std::time::Instant::now(),
            max_progress,
            message: message.to_owned(),
        };

        match Taskbar::new() {
            Ok(mut taskbar) => {
                match Window::get_console_window() {
                    Some(mut window) => {
                        taskbar.set_progress_state(&mut window, ProgressState::Normal).expect("");
                    },
                    _ => {}
                }
            },
            _ => {}
        }

        let mut guard = self.private.lock().unwrap();
        *guard = Some(private);
    }

    fn progress(&self, current: u64) {
        if let Some(p) = self.private.lock().unwrap().as_mut() {
            let max_bytes = match p.max_progress {
                Some(bytes) => format!("{:?}", bytes),
                None => "{unknown}".to_owned(),
            };

            match Taskbar::new() {
                Ok(mut taskbar) => {
                    match Window::get_console_window() {
                        Some(mut window) => {
                            taskbar.set_progress_value(&mut window, current.clone(), max_bytes.clone().parse().unwrap()).expect("");
                        },
                        _ => {}
                    }
                },
                _ => {}
            }

            if p.last_update.elapsed().as_millis() >= 1000 {
                println!(
                  "Downloading App: {} of {} bytes. [{}]",
                  current, max_bytes, p.message
                );
                p.last_update = std::time::Instant::now();
            }
        }
    }

    fn set_message(&self, message: &str) {
        println!("App: Message changed to: {}", message);
    }

    fn done(&self) {
        let mut guard = self.private.lock().unwrap();
        *guard = None;

        match Taskbar::new() {
            Ok(mut taskbar) => {
                match Window::get_console_window() {
                    Some(mut window) => {
                        taskbar.set_progress_state(&mut window, ProgressState::NoProgress).expect("");
                    },
                    _ => {}
                }
            },
            _ => {}
        }

        println!("App Download Status: [DONE]");
    }
}

pub fn download(file: &str, path: &str, name: &str) -> u8 {
    let datas = create_dir_all(path);
    match datas {
        Err(daras) => println!("{}", daras.to_string()),
        Ok(()) => println!("Created Dir for files"),
    };

    let mut downloader = Downloader::builder()
        .download_folder(Path::new(path))
        .parallel_requests(32)
        .build()
        .unwrap();

    let dl = downloader::Download::new(file).file_name(std::path::Path::new(name));

    #[cfg(not(feature = "tui"))]
    let dl = dl.progress(SimpleReporter::create());

    let result = downloader.download(&[dl]).unwrap();

    let mut status = 0;

    for r in result {
        match r {
            Err(e) => {
                println!("Error: {}", e.to_string());
                status = 1;
            },
            Ok(s) => {
                println!("Success: {}", &s);
                status = 0;
            },
        };
    }
    status
}
