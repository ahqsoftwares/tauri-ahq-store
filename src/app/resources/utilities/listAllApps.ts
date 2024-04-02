import { invoke } from "@tauri-apps/api/core";
import { list_apps } from "../core";

interface Apps {
  [key: string]: string;
}

export type { Apps };
export default async function listAllApps(): Promise<Apps> {
  let apps: Apps = {};

  const appList = await list_apps();

  for (let i = 0; i < appList.length; i++) {
    const appData = appList[i];

    const appId = appData.id;
    const version = appData.version;

    apps[appId] = version;
  }

  return apps;
}
