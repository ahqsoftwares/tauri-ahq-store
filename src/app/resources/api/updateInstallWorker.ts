import installWorker from "../classes/installWorker";
import Updater from "../classes/updater";

const updater = new Updater();

export function runAutoUpdate(status: boolean) {
         updater.start(status);
}

export function runManualUpdate() {
         updater.runUpdates();
}

export async function installApp(appId: string[], callback: (event: string, data: any) => void) {
         await new installWorker(callback).install(false, appId);
}

export async function unInstall(appId: string) {
         await new installWorker(() => {}).uninstall(appId);
}

export async function isInstalled(appId: string): Promise<boolean> {
         return await new installWorker(() => {}).exists(appId) as boolean;
}

export function updaterStatus() {
         return {
                  status: updater.updateStatus,
                  apps: updater.updatingAppList,
                  updating: updater.updatingApp
         }
}