import { sendNotification } from "@tauri-apps/plugin-notification";
import { Prefs } from ".";
import { ApplicationData } from "../api/fetchApps";
import { relaunch } from "@tauri-apps/plugin-process";
import { fetch } from "@tauri-apps/plugin-http";

type Methods =
  | "Error"
  | "Disconnect"
  | "AppData"
  | "ListApps"
  | "DownloadStarted"
  | "DownloadProgress"
  | "Installing"
  | "Installed"
  | "UninstallStarting"
  | "Uninstalled"
  | "Prefs"
  | "PrefsSet"
  | "TerminateBlock"
  | "Unknown"
  | "SHAId"
  | "Library";

type ErrorType =
  | "GetAppFailed"
  | "AppInstallError"
  | "AppUninstallError"
  | "PrefsError";

interface Error {
  type: ErrorType;
  details: any[];
}

type ListedApps = [string, string][];
interface Downloaded {
  c: number;
  t: number;
}

interface ServerResponse {
  ref: number;
  method: Methods;
  error: Error[];
  data: ListedApps | ApplicationData | Prefs | Downloaded | string;
}

export type {
  Error,
  ErrorType,
  Methods,
  ServerResponse,
  ListedApps,
  Downloaded,
};

export async function interpret(
  data: string,
): Promise<ServerResponse | undefined> {
  const into_array: { [key: string]: any } = JSON.parse(data);

  const [mode, valueData] = Object.entries(into_array)[0];

  if (mode == "PrefsSet") {
    return {
      data: [],
      error: [],
      method: "PrefsSet",
      ref: valueData,
    };
  }

  let result: ServerResponse = {
    error: [],
    method: "Unknown",
    ref: -1,
    data: [],
  };

  const [ref_id] = valueData;
  result.ref = Number(ref_id);

  const pyld = valueData.length > 1 ? valueData[1] : undefined;
  const pyld2 = valueData.length > 2 ? valueData[2] : undefined;

  switch (mode) {
    case "ListApps":
      result.data = pyld as ListedApps;
      result.method = "ListApps";
      break;
    case "Prefs":
      result.method = "Prefs";
      result.data = pyld as Prefs;
      break;
    case "SHAId":
      result.method = "SHAId";
      result.data = pyld as string;
      break;
    case "Library":
      result.method = "Library";

      console.log(pyld2);
      break;
    case "AppDataUrl":
      result.method = "AppData";

      const { data } = await fetch(pyld2, {
        method: "GET"
      }).then(async (r) => ({ ...r, data: await r.json() }));

      const adata: ApplicationData = {
        ...data,
      };

      result.data = adata;
      break;
    case "DownloadStarted":
      result.method = "DownloadStarted";
      break;
    case "DownloadProgress":
      result.method = "DownloadProgress";
      result.data = {
        c: pyld2[0],
        t: pyld2[1],
      } as Downloaded;
      break;
    case "Installing":
      result.method = "Installing";
      break;
    case "Installed":
      result.method = "Installed";
      break;
    case "Uninstalled":
      result.method = "Uninstalled";
      break;
    case "TerminateBlock":
      result.method = "TerminateBlock";
      break;
    case "Error":
      result.method = "Error";

      const [eType, eData] = Object.entries<{ [key: string]: any[] }>(
        ref_id,
      )[0];

      switch (eType) {
        case "AppInstallError":
          result.error = [
            {
              type: "AppInstallError",
              details: eData as unknown as any[],
            },
          ];
          result.ref = Number(eData[0]);
          break;
        default:
          break;
      }

      sendNotification({
        title: "Error",
        body: `The application had suffered an error from which it was unable to recover, relaunching app\n\n${JSON.stringify({ type: eType, data: eData })}`,
      });

      relaunch();
      break;
    default:
      return undefined;
  }

  return result;
}
