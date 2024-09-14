#! /bin/bash
cargo build --features sudo
sudo /mnt/ahqdrive/GitHub/ahq-store-tauri/src-service/target/debug/ahqstore_service