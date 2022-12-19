import * as Comlink from "comlink";

const appWorker = Comlink.wrap(
  new Worker(`import * as Comlink from "comlink";

         const appWorker = {
                  fetchApps: async() => {
                           console.log("hi");
                  }
         }
         
         Comlink.expose(appWorker);`)
) as any;

export async function fetchApps() {
  return await appWorker.fetchApps();
}
