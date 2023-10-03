sc stop "AHQ Store Service Debug v2"
cargo fmt -- --config tab_spaces=2
cargo build
sc start "AHQ Store Service Debug v2"