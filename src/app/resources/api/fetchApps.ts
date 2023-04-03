import { fetch } from "@tauri-apps/api/http";
import packageImg from "../package.png";

let commit_id = "";

type appData = {
  title: string;
  description: string;
  img: string;
  id?: string;
  download_url: string;
  longDesc: string;
  version: string;
  exe: string;
  author: {
    id: string;
  };
};

interface cacheData extends appData {
  author: any;
}

let cache: {
  [key: string]: cacheData;
} = {};

export type { cacheData };

export async function init(): Promise<string> {
  return await fetch(
    "https://api.github.com/repos/ahqalt/ahq-store-data/commits/main",
    {
      responseType: 1,
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      },
    }
  ).then(({ data }) => {
    commit_id = (data as any).sha;
    return (data as any).sha as string;
  });
}

export default async function fetchApps(
  apps: string | string[],
  forUpdate?: boolean
): Promise<cacheData | cacheData[]> {
  if (typeof apps === "string") {
    return (await resolveApps([apps], forUpdate))[0];
  } else {
    return await resolveApps([...apps], forUpdate);
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
      await fetch(
        `https://rawcdn.githack.com/altalt/ahq-store-data/${commit_id}/database/search.json`,
        {
          method: "GET",
          responseType: 1,
        }
      )
    ).data;
    searchDataCache = data as SearchData[];
    return data as SearchData[];
  }
}

export async function fetchAuthor(id: string) {
  return (await fetch(
    `https://rawcdn.githack.com/altalt/ahq-store-data/${commit_id}/database/user${id}.json`,
    {
      method: "GET",
      responseType: 1,
    }
  )) as any;
}

async function resolveApps(apps: string[], forUpdate?: boolean) {
  let promises = [];

  if (forUpdate) {
    await init();
  }

  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    promises.push(getApp(app, forUpdate));
  }

  return await Promise.all(promises);
}

async function getApp(appName: string, launchForUpdate?: boolean) {
  let data: any = {};

  if ((appName || "") === "") {
    throw new Error("Error reading app");
  }

  if (!commit_id) {
    throw new Error("Error reading app");
  }

  if (!launchForUpdate && cache[appName]) {
    data = cache[appName];
  } else {
    const mainAppData = await fetch(
      `https://rawcdn.githack.com/altalt/ahq-store-data/${commit_id}/database/${appName}.json`,
      {
        method: "GET",
        responseType: 1,
      }
    )
      .then(({ data, ok }) => {
        if (ok) {
          return data as appData;
        } else {
          if (cache[appName]) {
            return cache[appName] as appData;
          } else {
            throw new Error("Not Found Error!");
          }
        }
      })
      .catch((_e) => {
        return {
          title: `Unknown`,
          description: "App not Found",
          longDesc: "",
          id: appName,
          download_url: "",
          version: "v0.0.0",
          img: packageImg,
          author: {
            id: "unknown",
          },
        } as appData;
      });

    const authorData = await fetch(
      `https://rawcdn.githack.com/altalt/ahq-store-data/${commit_id}/database/user${mainAppData.author.id}.json`,
      {
        method: "GET",
        responseType: 1,
      }
    )
      .then(({ data, ok }) => {
        if (ok) {
          return data as any;
        } else {
          return {} as any;
        }
      })
      .catch(() => {
        return {};
      });

    let fullAnswer = {
      id: appName,
      ...mainAppData,
      author: {
        id: mainAppData.author.id,
        ...authorData,
      },
    };

    cache[appName] = fullAnswer;
    data = fullAnswer;
  }

  return data;
}
