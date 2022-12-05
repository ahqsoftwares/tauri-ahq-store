import { fetch } from "@tauri-apps/api/http";
import packageImg from "../package.png";

type appData = {
  title: string;
  description: string;
  img: string;
  id?: string;
  download_url: string;
  version: string;
  exe: string;
  author: {
    id: string
  }
};

interface cacheData extends appData {
  author: any;
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

export async function fetchAuthor(id: string) {
  return (await fetch(
    `https://raw.githack.com/ahqsoftwares/ahq-store-data/main/database/user${id}.json`,
    {
      method: "GET",
      responseType: 1,
    }
  )) as any;
}

async function resolveApps(apps: string[]) {
  let promises = [];
  console.log(apps);
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
    const mainAppData = await fetch(
      `https://raw.githack.com/ahqsoftwares/ahq-store-data/main/database/${appName}.json`,
      {
        method: "GET",
        responseType: 1,
      }
    )
    .then(({ data, ok }) => {
      if (ok) {
        return data as appData;
      } else {
        throw new Error("Not Found!");
      }
    })
    .catch(() => {
      return {
        title: `Unknown`,
        description: "App not Found",
        id: appName,
        download_url: "",
        version: "v0.0.0",
        img: packageImg,
        author: {
          id: "unknown"
        }
      } as appData;
    });
    
    const authorData = await fetch(
      `https://raw.githack.com/ahqsoftwares/ahq-store-data/main/database/user${mainAppData.author.id}.json`,
      {
        method: "GET",
        responseType: 1,
      }
    )
    .then(({ data }) => {
      return data as any;
    })
    .catch(() => {
      return {

      };
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
