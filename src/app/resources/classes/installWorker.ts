/* eslint-disable @typescript-eslint/no-unused-vars */
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import fetchApps from "../api/fetchApps";
import { list_apps, un_install } from "../core";

/**
 * Types
 */
import { InstallWorkerCallback, IDownloadAppData, IInstallAppData } from "../types/classes";
import { IAppDataApi } from "../types/api";

export default class installWorker {
  appId?: string[];
  callback: InstallWorkerCallback

  /**
   * Starts the downloader
   * @param {InstallWorkerCallback} callback
   * @param {boolean} appId
   */
  constructor(
    callback: InstallWorkerCallback,
    appId?: string[],
  ) {
    this.appId = appId;
    this.callback = callback;
  }

  async clean(path: string) {
    await invoke("clean", {
      path,
    }).catch(console.log);
  }

  async download(appData: IDownloadAppData) {
    const sysDir = await invoke("sys_handler");

    await this.clean(
      `${sysDir}\\ProgramData\\AHQ Store Applications\\Installers\\${appData.id}.zip`,
    );

    await this.uninstall(appData.id);

    this.callback("downloading", {
      ...appData,
    });

    const unlistenWindow = await appWindow.listen(
      "download-status",
      ({ payload }: { payload: any[] }) => {
        this.callback("downloadstat", {
          percent: Math.round((payload[0] / payload[1]) * 100),
          total: payload[1],
        });
      },
    );

    await invoke("download", {
      url: appData.download_url,
      name: `${appData.id}.zip`,
    });

    unlistenWindow();

    this.callback("installing", {
      ...appData,
    });

    await invoke("extract", {
      app: appData.id,
      version: appData.version,
    });

    await invoke("clean", {
      path: `${sysDir}\\ProgramData\\AHQ Store Applications\\Installers\\${appData.id}.zip`,
    });

    await invoke("shortcut", {
      app: `${appData.id}\\${appData.exe}`,
      appName: appData.name,
    });
  }

  async install(appId?: string[]) {
    let apps: IInstallAppData[] = [];

    const rawApps = this.appId && !appId ? this.appId : (appId as string[]);

    apps = ((await fetchApps(rawApps)) as IAppDataApi[]).map((value) => {
      const { download, version, exe, title } = value;
      return {
        download_url: download,
        version,
        exe,
        name: title,
      };
    });

    const allApps = await Promise.all(apps);

    for (const app of allApps) {
      const index = allApps.findIndex(
        (value) => value.download_url === app.download_url,
      );
      this.callback("downloading", {
        ...app,
        customId: index,
      });
      await this.download({
        id: rawApps[index],
        version: app.version,
        exe: app.exe,
        name: app.name,
        download_url: app.download_url,
      });
    }
  }

  uninstall(appId: string) {
    return un_install([appId]);
  }

  async exists(appId: string) {
    const appList = await list_apps();

    return appList.findIndex(({ id }) => id == appId) != -1;
  }
}
