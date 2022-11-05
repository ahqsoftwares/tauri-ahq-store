//Interfaces
type updateStatus = "checking" | "updating" | "updated";

export type {updateStatus};

export default class Updater {
         autoUpdate?: boolean;
         updateStatus?: updateStatus;
         updatingApp?: string;
         updatesRemaining?: string;
         currentTimer?: NodeJS.Timer;

         /**
          * Starts the updater process
          * @param {boolean} auto Is autoupdate turned on?
          */
         start(
                  auto: boolean
         ) {
                  if (this.autoUpdate === undefined) {
                           this.autoUpdate = auto;
                           if (auto) this.startCounter();
                  }
         }

         startCounter() {
                  if (this.currentTimer) {
                           this.stopCounter();
                  }
                  this.runUpdates();
                  this.currentTimer = setInterval(() => {
                           this.runUpdates();
                  }, 10 * 60 * 60 * 1000);
         }

         stopCounter() {
                  clearInterval(this.currentTimer);
         }

         runUpdates() {
                  console.log("Updater RAN");
                  this.installUpdates();
         }

         async checkForUpdates() {
                  return ["a", "b"];
         }

         async installUpdates() {
                  
         }
}