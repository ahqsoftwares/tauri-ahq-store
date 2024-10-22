import { get_app, get_dev_data } from "../core";

import { AHQStoreApplication, DevData } from "ahqstore-types/ahqstore_types";
import { invoke } from "@tauri-apps/api/core";

type AuthorObject = DevData;

type appData = AHQStoreApplication;

let cache: {
  [key: string]: appData;
} = {};
let authorCache: {
  [key: string]: AuthorObject;
} = {};
let resources: {
  [key: string]: string;
} = {};

export default async function fetchApps(
  apps: string | string[],
): Promise<appData | appData[]> {
  if (typeof apps === "string") {
    return (await resolveApps([apps]))[0];
  } else if (Array.isArray(apps)) {
    return await resolveApps([...apps]);
  } else {
    return [];
  }
}

export async function getResource(appId: string, uid: string) {
  if (resources[`${appId}-${uid}`] != undefined) {
    return resources[`${appId}-${uid}`];
  }

  const buf = await invoke("get_app_asset", { app: appId, asset: uid })
    .then(async (r) =>
      r as ArrayBuffer
    )
    .then((d) => {
      if (d) {
        return URL.createObjectURL(new Blob([d]));
      }
      throw new Error("empty array buffer");
    });

  resources[`${appId}-${uid}`] = buf;

  return buf;
}

export async function fetchAuthor(uid: string) {
  if (authorCache[uid]) {
    return authorCache[uid];
  }

  const author = await get_dev_data(uid) as AuthorObject;

  authorCache[uid] = author;

  return author;
}

async function resolveApps(apps: string[]): Promise<appData[]> {
  let promises: Promise<appData>[] = [];

  apps.forEach((appId) => {
    if (cache[appId]) {
      promises.push(
        (async () => {
          return cache[appId];
        })(),
      );
    } else {
      promises.push(
        (async () => {
          const app = await get_app(appId);

          const appData = {
            ...app,
            id: appId,
          } as appData;

          cache[appId] = appData;

          return appData;
        })(),
      );
    }
  });

  return await Promise.all(promises);
}

export type { appData };
export type { AuthorObject };

type ApplicationData = appData;
export type { ApplicationData };
