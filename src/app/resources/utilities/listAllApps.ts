import { invoke } from "@tauri-apps/api/tauri";

interface Apps {
         [key: string]: string
}

export type {Apps};
export default async function listAllApps(): Promise<Apps> {
         let apps: Apps = {

         }

         const [appList, versionList] = await invoke("list_all_apps") as [Array<string>, Array<string>];
         
         for (let i = 0; i < appList.length; i++) {
                  const appName = appList[i];
                  const version = versionList[i];

                  apps[appName] = version;
         }

         return apps;
}