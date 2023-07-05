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
