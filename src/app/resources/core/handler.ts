import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";

let send: { data: Object; resolve: (value: any) => void }[] = [];
let toResolve: { data: Object; resolve: (value: any) => void }[] = [];

export function sendWsRequest(data: Object, result: (value: any) => void) {
  queueAndWait(data, result);
}

function queueAndWait(data: Object, result: (value: any) => void) {
  send.push({
    data,
    resolve: (value) => {
      result(value);
    },
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
  const toObj: string[] = JSON.parse(payload);

  toObj.forEach((str) => {
    const toObj: any = JSON.parse(str);

    toResolve = toResolve.filter(({ data, resolve }) => {
      let a = JSON.parse(toObj.ref_id);
      delete a["token"];

      Object.entries(a).forEach(([k, v]) => {
        if (v == undefined || v == null) {
          delete a[k];
        }
      });

      if (JSON.stringify(a) == JSON.stringify(data)) {
        resolve(toObj);
        if (toObj?.method == "TERMINATE") {
          return false;
        }
      }

      return true;
    });
  });
});
