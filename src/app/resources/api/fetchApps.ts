import fetch from "../core/http";
import { get_app, get_devs_apps, get_search_data } from "../core";
import { server } from "../../server";

interface AuthorObject {
  u_id: number;
  username: string;
  pub_email: string;
  linked_acc: string[];
  display_name: string;
  pf_pic?: string;
  ahq_verified: boolean;
  apps: string[];
}

type Str = string;

interface appData {
  appId: Str;
  appShortcutName: Str;
  appDisplayName: Str;
  authorId: Str;
  downloadUrls: {
    [key: number]: {
      installerType:
        | "WindowsZip"
        | "WindowsInstallerExe"
        | "WindowsInstallerMsi"
        | "WindowsUWPMsix"
        | "LinuxAppImage";
      url: Str;
    };
  };
  install: {
    win32: unknown | undefined;
    linux: unknown | undefined;
    installType: "PerUser" | "Computer" | "Both";
  };
  displayImages: Str[];
  description: Str;
  icon: Str;
  repo: {
    author: Str;
    repo: Str;
  };
  version: Str;
  AuthorObject: AuthorObject;
}

let cache: {
  [key: string]: appData;
} = {};
let authorCache: {
  [key: string]: AuthorObject;
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

export async function fetchAuthor(id: string) {
  if (authorCache[id]) {
    return authorCache[id];
  }

  let author = (
    await fetch(`${server}/users/${id}`, {
      method: "GET",
      responseType: 1,
    })
  ).data as AuthorObject;

  author.apps = await get_devs_apps(id);
  authorCache[id] = author;

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
          const authorObj = await fetchAuthor(app.authorId);

          const appData = {
            ...app,
            id: appId,
            AuthorObject: authorObj,
          };

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
