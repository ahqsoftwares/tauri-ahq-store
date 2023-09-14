sc stop "AHQ Store Service Debug v2"
cargo fmt
cargo build
sc start "AHQ Store Service Debug v2"