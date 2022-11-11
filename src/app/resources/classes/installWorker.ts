/* eslint-disable @typescript-eslint/no-unused-vars */
import { invoke } from "@tauri-apps/api/tauri";
import fetchApps, { cacheData } from "../api/fetchApps";

export default class installWorker {
         appId?: string[];
         callback: (event: "installing" | "downloading", data: any) => void

         /**
          * Starts the downloader
          * @param {(event: string, data: any) => void} callback
          * @param {boolean} appId
          */
         constructor(
                  callback: (event: "installing" | "downloading", data: any) => void,
                  appId?: string[]
         ) {
                  this.appId = appId;
                  this.callback = callback; 
         }

         async clean(
                  path: string
         ) {
                  await invoke("clean", {
                           path
                  }).catch(console.log);
         }

         async download(
                  appData: {
                           id: string,
                           version: string,
                           download_url: string,
                           exe: string,
                           name: string,
                           update?: boolean
                  }
         ) {
                  const sysDir = await invoke("sys_handler");

                  await this.clean(`${sysDir}\\ProgramData\\AHQ Store Applications\\Installers\\${appData.id}.zip`);

                  await invoke("download", {
                           url: appData.download_url,
                           name: `${appData.id}.zip`
                  });

                  this.callback("installing", {
                           ...appData
                  });

                  await invoke("extract", {
                           app: appData.id,
                           version: appData.version
                  });

                  await invoke("clean", {
                           path: `${sysDir}\\ProgramData\\AHQ Store Applications\\Installers\\${appData.id}.zip`
                  });

                  if (!appData.update) {
                           await invoke("shortcut", {
                                    app: `${appData.id}\\${appData.exe}`,
                                    appName: appData.name
                           });
                  }
         }

         async install(
                  update?: boolean,
                  appId?: string[]
         ) {
                  let apps: {download_url: string, version: string, exe: string, name: string}[] = [];
                  
                  const rawApps = (this.appId && !appId) ? this.appId : appId as string[];

                  apps = (await fetchApps(rawApps) as cacheData[]).map(
                           (value) => {
                                    const {
                                             download_url,
                                             version,
                                             exe,
                                             title
                                    } = value;
                                    return {
                                             download_url,
                                             version,
                                             exe,
                                             name: title
                                    };
                           }
                  );

                  const allApps = await Promise.all(apps);

                  for (const app of allApps) {
                           const index = allApps.findIndex((value) => value.download_url === app.download_url);
                           this.callback("downloading", {
                                    ...app,
                                    customId: index
                           });
                           await this.download({
                                    id: rawApps[index],
                                    version: app.version,
                                    exe: app.exe,
                                    name: app.name,
                                    download_url: app.download_url,
                                    update
                           });
                  }
         }

         async uninstall(
                  appId: string
         ) {
                  const app = await fetchApps(appId);

                  invoke("uninstall", {
                           appName: appId,
                           appFullName: (app as cacheData).title
                  });
         }

         async exists(
                  appId: string
         ) {
                  return await invoke("check_app", {appName: appId});
         }
}