const { readFileSync, writeFileSync, readdirSync } = require("fs");

const gh_path_to_service =
  "D:\\a\\tauri-ahq-store\\tauri-ahq-store\\src-service\\target\\release\\ahqstore_service.exe";

const data = readFileSync(gh_path_to_service);

console.log("✅ Loaded Service file in the setup");

writeFileSync("./src-setup/src/bin/service.exe", data);

const dir_to_look =
  "D:\\a\\tauri-ahq-store\\tauri-ahq-store\\src-tauri\\target\\release\\bundle\\msi\\";

const msi_file = readdirSync(dir_to_look).find((f) => f.endsWith(".msi"));

const file = `${dir_to_look}${msi_file}`;

console.log("✅ Loaded installer file in the setup");

writeFileSync(file, "./src-setup/src/bin/installer.msi");
