import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";

type u64 = Number;

type Object = {
  [key: string | number | symbol]: any;
};

type WsResp = {
  method: string;
  payload: string;
  ref_id: string;
};

let send: { data: Object; ref_id: u64; resolve: (value: Object) => void }[] =
  [];
let toResolve: {
  data: Object;
  ref_id: u64;
  resolve: (value: Object) => void;
}[] = [];

export function sendWsRequest(data: Object, result: (value: Object) => void) {
  queueAndWait(data, result);
}

let ref_counter = 0;

function queueAndWait(data: Object, result: (value: Object) => void) {
  ref_counter++;

  send.push({
    data: {
      ...data,
    },
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
  const toObj: string[] = JSON.parse(payload);

  toObj.forEach((str) => {
    const toObj: WsResp = JSON.parse(str);

    if (toObj.method == "INSTALLAPP") {
      if (Number(toObj.payload.split("of")[0]) > 0) {
        const [c, t] = toObj.payload.split("of");

        invoke("set_progress", {
          state: 2,
          c: Number(c),
          t: Number(t),
        });
      } else if (toObj.payload.startsWith("DOWNLOAD STATUS:")) {
        invoke("set_progress", {
          state: 0,
        });
      }
    }

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
          resolve({});
          return false;
        }
      }

      return true;
    });
  });
});
