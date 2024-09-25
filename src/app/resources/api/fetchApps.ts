import { devUserUrl, assetUrl, get_app, get_search_data, sha } from "../core";

import { AHQStoreApplication, DevData } from "ahqstore-types/ahqstore_types";
import fetch from "../core/http";

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

  const buf = await fetch(
    assetUrl.replace("{sha}", sha).replace("{app}", appId).replace("{id}", uid),
    {
      method: "GET",
    },
    false,
  )
    .then(async (r) => {
      const data = (r as any).resp as Response;
      if (data.body == null || !data.ok) {
        throw new Error("No body");
      }

      return await new Response(data.body).arrayBuffer();
    })
    .then((d) => {
      if (d) {
        return URL.createObjectURL(new Blob([d]));
      }
      throw new Error("empty array buffer");
    });

  resources[`${appId}-${uid}`] = buf;

  return buf;
}

let searchDataCache: SearchData[] = [];

interface SearchData {
  name: string;
  title: string;
  id: string;
}
export async function fetchSearchData() {
  if (searchDataCache.length >= 1) {
    return searchDataCache;
  } else {
    const data = await get_search_data<SearchData[]>();

    searchDataCache = data;
    return data;
  }
}

export async function fetchAuthor(uid: string) {
  if (authorCache[uid]) {
    return authorCache[uid];
  }

  const url = devUserUrl.replace("{sha}", sha).replace("{dev}", uid);
  console.log(url);
  const { data } = await fetch(url, {
    method: "GET",
  });
  const author = data as AuthorObject;

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
