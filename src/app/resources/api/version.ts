import { getVersion } from "@tauri-apps/api/app";

let version = "0.0.0";
export function loadAppVersion() {
  getVersion()
    .then((ver) => (version = ver))
    .catch(console.error);
}

export function getAppVersion(): string {
  return version;
}
