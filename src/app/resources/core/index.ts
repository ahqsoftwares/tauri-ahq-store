import { sendWsRequest } from "./handler";

export function get_commit(): Promise<string> {
  return new Promise((resolve) => {
    sendWsRequest(
      {
        module: "COMMIT",
      },
      (val) => {
        if (val.method == "COMMIT") {
          resolve(val.payload);
        }
      }
    );
  });
}

export function get_apps(apps: string[]): Promise<any[]> {
  return new Promise((resolve) => {
    sendWsRequest(
      {
        module: "APPS",
        data: JSON.stringify(apps),
      },
      (val) => {
        if (val.method == "APP") {
          resolve(
            JSON.parse(val.payload).map((data: any) => ({
              ...data.app,
              id: data.id,
            }))
          );
        }
      }
    );
  });
}

type u64 = number;

export function install_app(app: string, status_update: (c: u64, t: u64) => void) {
  return new Promise((resolve) => {
    sendWsRequest(
      {
        module: "INSTALL",
        data: JSON.stringify([app]),
      },
      (val) => {
        if (val.method == "INSTALLAPP") {
          if (Number(val.payload.split("of")[0]) > 0) {
            const [c, t] = val.payload.split("of");
            status_update(Number(c), Number(t));
          } else if (val.payload.startsWith("DOWNLOAD STATUS:")) {
            status_update(10000, 0);
          } else {
            resolve(val.payload);
          }
        } else if (val.method == "TERMINATE") {
          try {
            resolve(val.payload);
          } catch (_) {}
        }
      }
    );
  });
}

export function list_apps(): Promise<{id: string, version: string}[]> {
  return new Promise((resolve) => {
    sendWsRequest(
      {
        module: "LISTAPPS",
      },
      (val) => {
        if (val.method == "LISTAPPS") {
          resolve(JSON.parse(val.payload));
        }
      }
    );
  });
}

interface Prefs {
  launch_app: boolean;
  install_apps: boolean;
}

export type { Prefs };

export function get_access_perfs(): Promise<Prefs> {
  return new Promise((resolve) => {
    sendWsRequest(
      {
        module: "GET_PREFS",
      },
      (val) => {
        if (val.method == "GET_PREFS") {
          resolve(JSON.parse(val.payload));
        }
      }
    );
  });
}

export function set_access_prefs(prefs: Prefs): Promise<void> {
  return new Promise((resolve) => {
    sendWsRequest(
      {
        module: "POST_PREFS",
        data: JSON.stringify(prefs)
      },
      (val) => {
        if (val.method == "POST_PREFS") {
          resolve();
        }
      }
    );
  });
}

export function un_install(apps: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    sendWsRequest(
      {
        module: "UNINSTALL",
        data: JSON.stringify(apps),
      },
      (val) => {
        if (val.method == "UNINSTALLAPP") {
          if (JSON.parse(val.payload).length == 0) {
            resolve();
          } else {
            reject();
          }
        }
      }
    );
  });
}