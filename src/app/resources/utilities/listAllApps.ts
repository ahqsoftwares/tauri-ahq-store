import { list_apps } from "../core";

/**
 * Types
 */
import type { IApps } from "../types/utilities";

export default async function listAllApps(): Promise<IApps> {
  let apps: IApps = {};

  const appList = await list_apps();

  for (let i = 0; i < appList.length; i++) {
    const appData = appList[i];

    const appId = appData.id;
    const version = appData.version;

    apps[appId] = version;
  }

  return apps;
}
