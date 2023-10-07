import { un_install, list_apps } from "../core";

export async function unInstall(appId: string) {
  await un_install(appId);
}

export async function isInstalled(appId: string): Promise<boolean> {
  const appList = await list_apps();

  return appList.findIndex(({ id }) => id == appId) != -1;
}
