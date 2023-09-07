import { fetch } from "@tauri-apps/api/http";
import { get_apps, get_commit } from "../core";

/**
 * Types
 */
import type { IAppDataApi, IAuthorObject, ICache, ISearchData } from "../types/resources/api";

let commit_id = "";
let cache: ICache = {};

export async function init() {
  commit_id = await get_commit();

  return commit_id;
}

export default async function fetchApps(
  apps: string | string[],
): Promise<IAppDataApi | IAppDataApi[]> {
  if (typeof apps === "string") {
    return (await resolveApps([apps]))[0];
  } else {
    return await resolveApps([...apps]);
  }
}

let searchDataCache: ISearchData[] = [];

export async function fetchSearchData() {
  if (searchDataCache.length >= 1) {
    return searchDataCache;
  } else {
    let data = (
      await fetch(
        `https://rawcdn.githack.com/ahqsoftwares/ahq-store-data/${commit_id}/database/search.json`,
        {
          method: "GET",
          responseType: 1,
        },
      )
    ).data;
    searchDataCache = data as ISearchData[];
    return data as ISearchData[];
  }
}

export async function fetchAuthor(id: string, partial = true) {
  let author = (
    await fetch(
      `https://rawcdn.githack.com/ahqsoftwares/ahq-store-data/${commit_id}/database/dev_${id}.json`,
      {
        method: "GET",
        responseType: 1,
      },
    )
  ).data as IAuthorObject;

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

async function resolveApps(apps: string[]): Promise<IAppDataApi[]> {
  let promises: Promise<IAppDataApi>[] = [];

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
            AuthorObject: authorObj,
          };

          return {
            ...app[0],
            AuthorObject: authorObj,
          };
        })(),
      );
    }
  });

  return await Promise.all(promises);
}