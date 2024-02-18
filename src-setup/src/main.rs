#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
slint::include_modules!();

use slint::SharedString;
use std::env::args;

mod elevate;
mod install;
pub mod utils;

#[derive(Debug, Clone, Copy)]
pub enum InstallMode {
  None,
  Install,
  InstallPR,
}

fn main() -> Result<(), slint::PlatformError> {
  let arg = args().collect::<Vec<_>>();

  let update = if arg.len() > 1 {
    if &arg[1] == "update" {
      InstallMode::Install
    } else {
      InstallMode::InstallPR
    }
  } else {
    InstallMode::None
  };

  elevate::relaunch_if_needed(&update);
  let ui = AppWindow::new()?;

  if !matches!(update, InstallMode::None) {
    ui.set_counter(0.0);
    ui.set_msg(SharedString::from("Updating..."));
    ui.set_preview(matches!(update, InstallMode::InstallPR));

    install::start_install(ui.clone_strong(), update);
  }

  ui.on_start_install({
    let ui_handle = ui.as_weak();
    move || {
      let handle = ui_handle.unwrap();
      handle.set_counter(0.0);
      let install_mode = if handle.get_preview() {
        InstallMode::InstallPR
      } else {
        InstallMode::Install
      };

      install::start_install(handle, install_mode);
    }
  });

  ui.run()
}
