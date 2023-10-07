import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { Downloaded, ServerResponse, interpret } from "./structs";

let ref_counter = 0;

const WebSocketMessage = {
  GetApp: (app_id: string) => `{"GetApp":[{*ref_id},"${app_id}"]}`,
  InstallApp: (app_id: string) => `{"InstallApp":[{*ref_id},"${app_id}"]}`,
  UninstallApp: (app_id: string) => `{"UninstallApp":[{*ref_id},"${app_id}"]}`,
  ListApps: () => `{"ListApps":{*ref_id}}`,
};

type u64 = Number;

type CacheValues = { data: string; ref_id: u64; resolve: (value: ServerResponse) => void }[];

let send: CacheValues = [];
let toResolve: CacheValues = [];

export function sendWsRequest(data: string, result: (value: ServerResponse) => void) {
  queueAndWait(data, result);
}

export { WebSocketMessage };

function queueAndWait(data: string, result: (value: ServerResponse) => void) {
  ref_counter++;

  send.push({
    data: data.replace("{*ref_id}", String(ref_counter)),
    resolve: result,
    ref_id: ref_counter,
  });
}

export function runner() {
  setInterval(() => {
    send.forEach((req) => {
      toResolve.push(req);
      appWindow.emit("ws_send", req.data);
    });
    send = [];
  }, 100);
}

appWindow.listen<string>("ws_resp", ({ payload }) => {
  const toObj = interpret(payload);

  if (toObj) {
    if (toObj.method == "DownloadProgress") {
      const data = toObj.data as Downloaded;

      invoke("set_progress", {
        state: 1,
        c: data.c,
        t: data.t
      })
    } else {
      invoke("set_progress", {
        state: 0
      });
    }

    toResolve = toResolve.filter(({ ref_id, resolve }) => {
      if (ref_id == toObj.ref) {
        resolve(toObj);
      }
      if (toObj.method == "TerminateBlock") {
        return false;
      }

      return true;
    });
  }
});
