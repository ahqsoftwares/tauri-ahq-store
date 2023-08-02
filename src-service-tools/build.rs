use {std::io, winres::WindowsResource};

fn main() -> io::Result<()> {
    WindowsResource::new().set_icon("src/icon.ico").compile()?;
    Ok(())
}
