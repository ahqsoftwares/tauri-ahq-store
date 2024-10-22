import { invoke } from "@tauri-apps/api/core";
import { ApplicationData } from "../api/fetchApps";
import { WebSocketMessage, sendWsRequest } from "./handler";
import { Library } from "./installer";
import { ListedApps } from "./structs";
import { DevData } from "src-ahqstore-types/pkg/ahqstore_types";

const assetUrl =
  "https://rawcdn.githack.com/ahqstore/apps/{sha}/db/res/{app}/{id}";
const devUserUrl =
  "https://rawcdn.githack.com/ahqstore/apps/{sha}/users/{dev}.json";

export async function get_dev_data(dev: string) {
  return invoke<DevData>("get_dev_data", { dev });
}

export async function get_devs_apps(dev: string) {
  return invoke<string[]>("get_devs_apps", { dev });
}

export async function get_home() {
  return invoke<[String, String[]][]>("get_home")
}

export async function search<T>(query: string) {
  return invoke<T>("get_all_search", { query });
}

export function get_sha() {
  return new Promise((resolve) => {
    sendWsRequest(WebSocketMessage.GetSha(), (val) => {
      if (val.method == "SHAId") {
        const sha = val.data as string;
        console.log(sha);
        invoke("set_commit", {
          commit: sha
        });
        resolve(sha);
      }
    });
  });
}

export async function get_app(app: string): Promise<ApplicationData> {
  return invoke<ApplicationData>("get_app", { app });
}

export function install_app(app: string): Promise<undefined> {
  return new Promise((resolve) => {
    sendWsRequest(WebSocketMessage.InstallApp(app), () => { });
    resolve(undefined);
  });
}

export function list_apps(): Promise<{ id: string; version: string }[]> {
  return new Promise((resolve) => {
    sendWsRequest(WebSocketMessage.ListApps(), (val) => {
      if (val.method == "ListApps") {
        resolve(
          (val.data as ListedApps).map(([id, version]) => ({
            id,
            version,
          })),
        );
      }
    });
  });
}

export function get_library(): Promise<Library[]> {
  return new Promise((resolve) => {
    sendWsRequest(WebSocketMessage.GetLibrary(), (val) => {
      if (val.method == "Library") {
        resolve(val.data as unknown as Library[]);
      }
    });
  });
}

interface Prefs {
  launch_app: boolean;
  install_apps: boolean;
  auto_update_apps: boolean;
}

export type { Prefs };

let accessPrefs: Prefs | undefined;

export async function get_access_perfs(): Promise<Prefs> {
  if (accessPrefs != undefined) {
    return accessPrefs;
  }

  return new Promise((resolve) => {
    sendWsRequest(WebSocketMessage.GetPrefs(), (val) => {
      if (val.method == "Prefs") {
        accessPrefs = val.data as Prefs;
        resolve(val.data as Prefs);
      }
    });
  });
}

export async function set_access_prefs(prefs: Prefs): Promise<void> {
  accessPrefs = undefined;
  return new Promise((resolve) => {
    sendWsRequest(WebSocketMessage.SetPrefs(prefs), (val) => {
      if (val.method == "PrefsSet") {
        resolve();
      }
    });
  });
}

export function un_install(app: string): Promise<void> {
  return new Promise((resolve, reject) => {
    sendWsRequest(WebSocketMessage.UninstallApp(app), (val) => {
      if (val.method == "Uninstalled") {
        resolve();
      } else if (val.method == "Error") {
        reject();
      }
    });
  });
}

export { devUserUrl, assetUrl };
