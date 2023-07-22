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

export function list_apps(): Promise<string[]> {
  return new Promise((resolve) => {
    sendWsRequest(
      {
        module: "LISTAPPS",
      },
      (val) => {
        if (val.method == "LIST") {
          resolve(JSON.parse(val.payload));
        }
      }
    );
  });
}