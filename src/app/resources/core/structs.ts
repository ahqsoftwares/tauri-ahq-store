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

export function interpret(data: string) {
  const into_array: { [key: string]: any } = JSON.parse(data);

  const [mode, valueData] = Object.entries(into_array)[0];

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
    default:
      return undefined;
  }

  return result;
}

// #[derive(Serialize, Deserialize, Debug)]
// pub enum Reason {
//   UnknownData(RefId),

//   Unauthenticated,
// }

// #[derive(Serialize, Deserialize, Debug)]
// pub enum ErrorType {
//   GetAppFailed(RefId, AppId),
//   AppInstallError(RefId, AppId),
//   AppUninstallError(RefId, AppId),
//   PrefsError(RefId),
// }

// #[derive(Serialize, Deserialize, Debug)]
// pub enum Response {
//   Ready,

//   Error(ErrorType),

//   Disconnect(Reason),

//   AppData(RefId, AppId, AHQStoreApplication),

//   ListApps(RefId, Vec<AppData>),

//   DownloadStarted(RefId, AppId),
//   DownloadProgress(RefId, AppId, u8),
//   DownloadComplete(RefId, AppId),
//   Installing(RefId, AppId),
//   Installed(RefId, AppId),

//   UninstallStarting(RefId, AppId),
//   Uninstalled(RefId, AppId),

//   Prefs(RefId, Prefs),
//   PrefsSet(RefId),

//   TerminateBlock(RefId, Str)
// }