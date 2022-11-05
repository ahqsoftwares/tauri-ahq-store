import Updater from "../classes/updater";

const updater = new Updater();

export function runAutoUpdate(status: boolean) {
         updater.start(status);
}