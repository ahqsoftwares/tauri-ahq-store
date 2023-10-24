import { newServer } from "../../server";
import { ApplicationData } from "../api/fetchApps";
import { WebSocketMessage, sendWsRequest } from "./handler";
import fetch from "./http";
import { Downloaded, ListedApps } from "./structs";

export function get_home<T>() {
  return fetch<T>(`${newServer}/apps/home`, {
    method: "GET"
  });
}

export function get_map<T>() {
  return fetch<T>(`${newServer}/apps/map`, {
    method: "GET"
  });
}

export function get_app(app: string): Promise<ApplicationData> {
  return new Promise((resolve) => {
    sendWsRequest(
      WebSocketMessage.GetApp(app),
      (val) => {
        if (val.method == "AppData") {
          resolve(val.data as ApplicationData);
        }
      },
    );
  });
}

export function install_app(
  app: string,
  status_update: (data: Downloaded) => void,
): Promise<boolean> {
  return new Promise((resolve) => {
    sendWsRequest(
      WebSocketMessage.InstallApp(app),
      (val) => {
        switch (val.method) {
          case "DownloadProgress":
            status_update(val.data as Downloaded);
            break;
          case "Installing":
            status_update({
              c: 10000,
              t: 0
            });
            break;
          case "Installed":
            resolve(true);
            break;
          case "Error":
            resolve(false);
            break;
          default:
            break;
        }
      },
    );
  });
}

export function list_apps(): Promise<{ id: string; version: string }[]> {
  return new Promise((resolve) => {
    sendWsRequest(
      WebSocketMessage.ListApps(),
      (val) => {
        if (val.method == "ListApps") {
          resolve(
            (val.data as ListedApps).map(([id, version]) => ({
              id,
              version
            }))
          )
        }
      },
    );
  });
}

interface Prefs {
  launch_app: boolean;
  install_apps: boolean;
}

export type { Prefs };

let accessPrefs: Prefs | undefined;

export async function get_access_perfs(): Promise<Prefs> {
  if (accessPrefs != undefined) {
    return accessPrefs;
  }

  return new Promise((resolve) => {
    sendWsRequest(
      WebSocketMessage.GetPrefs(),
      (val) => {
        if (val.method == "Prefs") {
          accessPrefs = val.data as Prefs;
          resolve(val.data as Prefs);
        }
      },
    );
  });
}

export async function set_access_prefs(prefs: Prefs): Promise<void> {
  accessPrefs = undefined;
  return new Promise((resolve) => {
    sendWsRequest(
      WebSocketMessage.SetPrefs(prefs),
      (val) => {
        if (val.method == "PrefsSet") {
          resolve();
        }
      },
    );
  });
}

export function un_install(app: string): Promise<void> {
  return new Promise((resolve, reject) => {
    sendWsRequest(
      WebSocketMessage.UninstallApp(app),
      (val) => {
        if (val.method == "Uninstalled") {
          resolve();
        } else if (val.method == "Error") {
          reject();
        }
      },
    );
  });
}
