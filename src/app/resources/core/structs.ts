import { Prefs } from ".";
import { ApplicationData } from "../api/fetchApps";

type Methods = "Error" |
  "Disconnect" |
  "AppData" |
  "ListApps" |
  "DownloadStarted" |
  "DownloadProgress" |
  "Installing" |
  "Installed" |
  "UninstallStarting" |
  "Uninstalled" |
  "Prefs" |
  "PrefsSet" |
  "TerminateBlock" |
  "Unknown";

type ErrorType = "GetAppFailed" |
  "AppInstallError" |
  "AppUninstallError" |
  "PrefsError";

interface Error {
  type: ErrorType,
  details: any[]
}

type ListedApps = [string, string][];
interface Downloaded {
  c: number,
  t: number
}

interface ServerResponse {
  ref: number;
  method: Methods;
  error: Error[];
  data: ListedApps | ApplicationData | Prefs | Downloaded
}

export type {
  Error,
  ErrorType,
  Methods,
  ServerResponse,
  ListedApps,
  Downloaded
}

export function interpret(data: string): ServerResponse | undefined {
  const into_array: { [key: string]: any } = JSON.parse(data);

  const [mode, valueData] = Object.entries(into_array)[0];

  if (mode == "PrefsSet") {
    return {
      data: [],
      error: [],
      method: "PrefsSet",
      ref: valueData
    }
  }

  let result: ServerResponse = {
    error: [],
    method: "Unknown",
    ref: -1,
    data: []
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
    case "AppData":
      result.method = "AppData";
      const data: ApplicationData = {
        id: pyld,
        ...pyld2
      };

      result.data = data;
      break;
    case "DownloadStarted":
      result.method = "DownloadStarted";
      break;
    case "DownloadProgress":
      result.method = "DownloadProgress";
      result.data = {
        c: pyld2[0],
        t: pyld2[1]
      } as Downloaded;
      break;
    case "Installing":
      result.method = "Installed";
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

      const [eType, eData] = Object.entries<{ [key: string]: any[] }>(ref_id)[0];

      switch (eType) {
        case "AppInstallError":
          result.error = [
            {
              type: "AppInstallError",
              details: eData as unknown as any[]
            }
          ];
          result.ref = Number(eData[0]);
          break;
        default:
          break;
      }
      break;
    default:
      return undefined;
  }

  return result;
}