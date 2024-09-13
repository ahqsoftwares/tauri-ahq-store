fn main() {
  slint_build::compile("ui/appWindow.slint").unwrap();

  #[cfg(windows)]
  {
    let mut res = tauri_winres::WindowsResource::new();
    res.set_icon("icon.ico");
    res.compile().unwrap();
  }
}
