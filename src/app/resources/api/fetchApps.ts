import { fetch } from "@tauri-apps/api/http";

type cacheData = {
  title: string;
  description: string;
  id: string;
  img: string;
  download_url: string;
  author: any;
  version: string;
  exe: string;
};

let cache: {
  [key: string]: cacheData;
} = {};

export type { cacheData };
export default async function fetchApps(
  apps: string | string[]
): Promise<cacheData | cacheData[]> {
  if (typeof apps === "string") {
    return (await resolveApps([apps]))[0];
  } else {
    return await resolveApps([...apps]);
  }
}

async function resolveApps(apps: string[]) {
  let promises = [];

  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    promises.push(getApp(app));
  }

  return await Promise.all(promises);
}

async function getApp(appName: string) {
  let data: any = {};

  if (cache[appName]) {
    data = cache[appName];
  } else {
    const { data: mainAppData }: any = await fetch(
      `https://github.com/ahqsoftwares/ahq-store-data/raw/main/database/${appName}.json`,
      {
        method: "GET",
        responseType: 1,
      }
    );

    const { data: authorData }: any = await fetch(
      `https://github.com/ahqsoftwares/ahq-store-data/raw/main/database/user${mainAppData.author.id}.json`,
      {
        method: "GET",
        responseType: 1,
      }
    );

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
