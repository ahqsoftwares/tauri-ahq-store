#! /bin/bash
cargo build --features sudo
sudo ./target/debug/ahqstore_service