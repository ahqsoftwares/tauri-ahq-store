import { sendNotification } from "@tauri-apps/api/notification";
import { appWindow } from "@tauri-apps/api/window";
import fetchApps from "../api/fetchApps";
import getWindows from "../api/os";
import listAllApps, { Apps } from "../utilities/listAllApps";

//Interfaces
type updateStatus = "checking" | "updating" | "updated";

export type {updateStatus};

export default class Updater {
         autoUpdate?: boolean;
         updateStatus?: updateStatus;
         updatingApp?: string;
         updatingAppList?: string[];
         currentTimer?: NodeJS.Timer;
         state?: number;

         /**
          * Starts the updater process
          * @param {boolean} auto Is autoupdate turned on?
          */
         start(
                  auto: boolean
         ) {
                  if (this.autoUpdate === undefined) {
                           this.autoUpdate = auto;
                           if (auto) {
                                    this.runUpdates();
                           }
                  }
         }

         startCounter() {
                  if (this.currentTimer) {
                           this.stopCounter();
                  }
                  this.currentTimer = setTimeout(() => {
                           this.runUpdates();
                  }, 10 * 60 * 60 * 1000);
         }

         stopCounter() {
                  clearTimeout(this.currentTimer);
         }

         emitter() {
                  appWindow.emit("sendUpdaterStatus", JSON.stringify({
                           totalApps: this.updatingAppList,
                           currentlyUpdating: this.updatingApp,
                           status: this.updateStatus
                  }));
         }

         async runUpdates() {
                  this.state = this.state === undefined ? 0 : this.state + 1;

                  if (this.state === 0 || this.updateStatus === "updated") {
                           this.updateStatus = "checking";

                           this.emitter();

                           const updatableApps = await this.checkForUpdates();
                           this.updatingAppList = updatableApps;
                           this.updateStatus = updatableApps.length === 0 ? "updated" : "updating";

                           if (updatableApps.length !== 0) {
                                    sendNotification({
                                             title: "Updates Available",
                                             body: "Installing app updates..."
                                    });
                           }

                           this.emitter();
                  
                           this.installUpdates(updatableApps);
                  }
         }

         async checkForUpdates() {
                  const apps: Apps = await listAllApps();
                  
                  const appsData = (await fetchApps(Object.keys(apps)) as any[]).map((value) => value.version);

                  return Object.keys(apps).filter((_, index) => {
                           return Object.values(apps)[index] !== appsData[index];
                  });
         }

         async installUpdates(apps: string[]) {
                  this.updateStatus = "updating";
                  this.updatingApp = apps[0];
                  this.emitter();
                  this.updateStatus = "updated";
                  this.emitter();

                  if (this.autoUpdate) {
                           this.startCounter();
                  }
         }
}