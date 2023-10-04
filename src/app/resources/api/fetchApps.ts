import fetch from "../core/http";
import { get_apps } from "../core";
import { newServer } from "../../server";

let commit_id = "";

interface AuthorObject {
  displayName: string;
  email: string;
  apps:
    | []
    | {
        apps: string[];
        ignored: string[];
      };
}

interface appData {
  author: string;
  AuthorObject?: AuthorObject;
  description: string;
  download: string;
  exe: string;
  icon: string;
  repo: {
    author: string;
    repo: string;
  };
  title: string;
  displayName: string;
  version: string;
  id: string;
}

let cache: {
  [key: string]: appData;
} = {};

export default async function fetchApps(
  apps: string | string[],
): Promise<appData | appData[]> {
  console.log(apps);
  if (typeof apps === "string") {
    return (await resolveApps([apps]))[0];
  } else if (Array.isArray(apps)) {
    return await resolveApps([...apps]);
  } else {
    return [];
  }
}

let searchDataCache: SearchData[] = [];

interface SearchData {
  name: string;
  id: string;
}
export async function fetchSearchData() {
  if (searchDataCache.length >= 1) {
    return searchDataCache;
  } else {
    let data = (
      await fetch(`${newServer}/apps/search`, {
        method: "GET",
        responseType: 1,
      })
    ).data;
    searchDataCache = data as SearchData[];
    return data as SearchData[];
  }
}

export async function fetchAuthor(id: string, partial = true) {
  let author = (
    await fetch(`${newServer}/users/${id}`, {
      method: "GET",
      responseType: 1,
    })
  ).data as AuthorObject;

  if (!partial) {
    const apps = (
      await fetch(
        `https://rawcdn.githack.com/ahqsoftwares/ahq-store-data/${commit_id}/database/apps_dev_${id}.json`,
        {
          method: "GET",
          responseType: 1,
        },
      )
    ).data as any;

    author = {
      ...author,
      apps,
    };
  }

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
          const app = await get_apps([appId]);
          const authorObj = await fetchAuthor(app[0].author);

          cache[appId] = {
            ...app[0],
            id: appId,
            AuthorObject: authorObj,
          };

          return {
            ...app[0],
            id: appId,
            AuthorObject: authorObj,
          };
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
