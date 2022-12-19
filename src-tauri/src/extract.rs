use winapi_easy::ui::{Window, Taskbar, ProgressState};
use std::{path::Path, process::Command};

pub fn extract(path: &Path, location: &Path) -> i32 {
         match Taskbar::new() {
                  Ok(mut taskbar) => {
                           match Window::get_console_window() {
                                    Some(mut window) => {
                                             taskbar.set_progress_state(&mut window, ProgressState::Indeterminate).expect("");
                                    },
                                    _ => {}
                           }
                  },
                  _ => {}
         }

         let args: (&Path, &Path) = (path, location);
         print!("{} {}", args.0.to_string_lossy(), args.1.to_string_lossy());

         match Command::new("powershell")
         .args([
                  "-NoProfile",
                  "-WindowStyle", 
                  "Hidden"
         ])
         .args(["Expand-Archive", format!("-Path \"{}\"", args.0.to_string_lossy()).as_str(), format!("-DestinationPath \"{}\"", args.1.to_string_lossy()).as_str(), "-Force"])
         .spawn() {
                  Ok(mut child) => {
                           match child.wait() {
                                    Ok(status) => {
                                             if status.success() {
                                                      match Taskbar::new() {
                                                               Ok(mut taskbar) => {
                                                                        match Window::get_console_window() {
                                                                                 Some(mut window) => {
                                                                                          taskbar.set_progress_state(&mut window, ProgressState::NoProgress).expect("");
                                                                                 },
                                                                                 _ => {}
                                                                        }
                                                               },
                                                               _ => return 1
                                                      }
                                             } else {
                                                      return 1
                                             }
                                    },
                                    _ => return 1
                           }
                  },
                  _ => return 1
         }

         return 0;
}

pub fn run(path: String) -> bool {
         let mut child = Command::new(path).spawn().expect("Failed");
         let ecode = child.wait().expect("Failed!");
         println!("{}", ecode.to_string());
         return ecode.success();
}