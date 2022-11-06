import Updater from "../classes/updater";

const updater = new Updater();

export function runAutoUpdate(status: boolean) {
         updater.start(status);
}

export function runManualUpdate() {
         updater.runUpdates();
}

export function updaterStatus() {
         return {
                  status: updater.updateStatus,
                  left: updater.updatingAppList,
                  updating: updater.updatingApp
         }
}