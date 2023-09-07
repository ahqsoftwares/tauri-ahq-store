import { sendNotification } from "@tauri-apps/api/notification";
import { appWindow } from "@tauri-apps/api/window";
import fetchApps from "../api/fetchApps";
import listAllApps from "../utilities/listAllApps";
import installWorker from "./installWorker";

/**
 * Types
 */
import type { IApps } from "../types/resources/utilities";
import { UpdateStatus } from "../types/resources/classes";

export default class Updater {
  autoUpdate?: boolean;
  updateStatus: UpdateStatus;
  updatingApp?: string;
  updatingAppList?: string[];
  currentTimer?: number;
  state?: number;

  constructor() {
    this.updateStatus = "none";
  }
  /**
   * Starts the updater process
   * @param {boolean} auto Is autoupdate turned on?
   */
  start(auto: boolean) {
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
    this.currentTimer = setTimeout(
      () => {
        this.runUpdates();
      },
      10 * 60 * 60 * 1000,
    );
  }

  stopCounter() {
    clearTimeout(this.currentTimer);
  }

  emitter() {
    appWindow.emit(
      "sendUpdaterStatus",
      JSON.stringify({
        totalApps: this.updatingAppList,
        currentlyUpdating: this.updatingApp,
        status: this.updateStatus,
      }),
    );
  }

  async runUpdates() {
    this.state = this.state === undefined ? 0 : this.state + 1;

    if (this.state === 0 || this.updateStatus === "updated") {
      this.updateStatus = "checking";

      this.emitter();

      function updateRunner(global: Updater) {
        global
          .checkForUpdates()
          .then(async (updatableApps) => {
            global.updatingAppList = updatableApps;
            global.updateStatus =
              updatableApps.length === 0 ? "updated" : "updating";

            if (updatableApps.length > 0) {
              sendNotification({
                title: "Updates Available",
                body: "Installing app updates...",
              });
              global.installUpdates(updatableApps);
            }

            global.emitter();
          })
          .catch(() => {
            setTimeout(() => {
              updateRunner(global);
            }, 1000);
          });
      }
      updateRunner(this);
    }
  }

  async checkForUpdates() {
    const apps: IApps = await listAllApps();

    const appsData = ((await fetchApps(Object.keys(apps))) as any[]).map(
      (value) => value.version,
    );

    return Object.keys(apps).filter((_, index) => {
      return Object.values(apps)[index] !== appsData[index];
    });
  }

  async installUpdates(apps: string[]) {
    this.updateStatus = "updating";
    this.updatingApp = apps[0];
    this.emitter();

    await new installWorker((event, data) => {
      if (event === "installing") {
        const { customId } = data;

        this.updateStatus = "updating";
        this.updatingApp = (this.updatingAppList as string[])[customId];
        this.emitter();

        if (customId !== 0) {
          this.updatingAppList?.splice(0, 1);
        }
      }
    }, apps).install();

    this.updateStatus = "updated";
    this.emitter();

    if (this.autoUpdate) {
      this.startCounter();
    }
  }
}
