import { ApplicationData } from "../api/fetchApps";
import { WebSocketMessage, sendWsRequest } from "./handler";
import fetch from "./http";
import { Library } from "./installer";
import { ListedApps } from "./structs";

let sha = "";

const totalUrl = "https://rawcdn.githack.com/ahqstore/apps/{sha}/db/total";
const homeUrl = "https://rawcdn.githack.com/ahqstore/apps/{sha}/db/home.json";
const appUrl =
  "https://rawcdn.githack.com/ahqstore/apps/{sha}/db/apps/{app}.json";
const assetUrl =
  "https://rawcdn.githack.com/ahqstore/apps/{sha}/db/res/{app}/{id}";
const mapUrl =
  "https://rawcdn.githack.com/ahqstore/apps/{sha}/db/map/{id}.json";
const searchUrl =
  "https://rawcdn.githack.com/ahqstore/apps/{sha}/db/search/{id}.json";
const appsUserUrl =
  "https://rawcdn.githack.com/ahqstore/apps/{sha}/db/dev/{dev}";
const devUserUrl =
  "https://rawcdn.githack.com/ahqstore/apps/{sha}/users/{dev}.json";

export async function get_devs_apps(devId: string) {
  if (sha == "") {
    await get_sha();
  }
  const url = appsUserUrl.replace("{sha}", sha).replace("{dev}", devId);

  const { ok, data } = await fetch(url, {
    method: "GET",
  });

  let apps: string[] = ok ? data.split("\n") : [];

  apps = apps.filter((f) => f.trim() != "");

  return apps;
}

export async function get_total() {
  if (sha == "") {
    await get_sha();
  }

  const { data } = await fetch(totalUrl.replace("{sha}", sha), {
    method: "GET",
  });

  return Number(data);
}

export async function get_home() {
  if (sha == "") {
    await get_sha();
  }

  const url = homeUrl.replace("{sha}", sha);

  const { data } = await fetch(url, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });

  return data;
}

export async function get_search_data<T>() {
  if (sha == "") {
    await get_sha();
  }
  const map = [];

  const total = await get_total();

  for (let i = 1; i <= total; i++) {
    const url = searchUrl.replace("{sha}", sha).replace("{id}", i.toString());

    const val = await fetch(url, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    map.push(...val.data);
  }
  return map as unknown as any as T;
}

export async function get_map<T>(): Promise<T> {
  if (sha == "") {
    await get_sha();
  }
  const map = {};

  const total = await get_total();

  for (let i = 1; i <= total; i++) {
    const url = mapUrl.replace("{sha}", sha).replace("{id}", i.toString());

    const val = await fetch(url, {
      method: "GET",
    });
  }

  return map as unknown as any as T;
}

export function get_sha() {
  return new Promise((resolve) => {
    sendWsRequest(WebSocketMessage.GetSha(), (val) => {
      if (val.method == "SHAId") {
        sha = val.data as string;
        resolve(undefined);
      }
    });
  });
}

export async function get_app(app: string): Promise<ApplicationData> {
  const { data } = await fetch(
    appUrl.replace("{sha}", sha).replace("{app}", app),
    {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );

  const appData: ApplicationData = {
    ...data,
    icon: `data:image;base64,${data.icon}`,
  };

  return appData;
}

export function install_app(
  app: string
): Promise<undefined> {
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

export { devUserUrl, sha, assetUrl };
