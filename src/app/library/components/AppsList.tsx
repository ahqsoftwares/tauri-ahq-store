//Arrow
import { useEffect, useState } from "react";
import { GiPartyPopper } from "react-icons/gi";
import fetchApps, { appData } from "../../resources/api/fetchApps";
import Toast from "../../resources/api/toast";
import listAllApps from "../../resources/utilities/listAllApps";
import App from "./App";
import { IoApps } from "react-icons/io5";
import { Library } from "../../resources/core/installer";

interface Props {
  dark: boolean;
  library: Library[]
}

export default function AppsList(props: Props) {
  const { dark, library } = props;

  const [apps, setApps] = useState<appData[]>([]);
  const [rawApps, setRawApps] = useState(0);

  async function parseAppsData() {
    const apps = await listAllApps();
    if (Object.keys(apps).length === 0) {
      setRawApps(1);
    }
    const resolvedApps = await fetchApps(Object.keys(apps));
    setApps(resolvedApps as appData[]);
  }

  useEffect(() => {
    parseAppsData();
    const timeout = setInterval(() => parseAppsData(), 5000);

    return () => clearInterval(timeout);
  }, []);

  return (
    <div className="flex flex-col w-[98%] h-[100%] mx-auto">
      <div className="min-h-[auto] h-[100%] min-w-[100%] pb-[1rem] text-center">
        {rawApps === 1 ? (
          <h1
            className={`my-2 w-[100%] flex flex-row text-center items-center justify-center ${
              dark ? "text-slate-400" : "text-slate-700"
            }`}
          >
            Install some apps to get the fun started{" "}
            <GiPartyPopper size="1.5em" />
          </h1>
        ) : apps.length === 0 ? (
          <h1
              className={`my-2 mt-5 flex items-center justify-center text-center ${dark ? "text-slate-400" : "text-slate-700"}`}
          >
            <span className="dui-loading dui-loading-spinner mr-2"></span>
              Loading Installed Apps...
          </h1>
        ) : (
              <>
                <h1
                  className={`my-2 text-2xl flex text-center items-center text-base-content`}
                >
                  <IoApps size="1.5rem" />
                  <span className="ml-2">Installed Apps</span>
                </h1>
                <div className={`flex py-auto`}>
                  {"("}
                  <div className={dark ? "text-purple-500" : "text-purple-900"}>
                    v
                  </div>
                  <span className="text-base-content ml-1">
                    {"represents unique version hash)"}
                  </span>
                </div>
              </>
        )}

        {apps.map((data) => {
          return (
            <App
              key={data.appId}
              appInfo={data}
              dark={dark}
              toast={Toast}
              lib={library.find((d) => d.app_id == data.appId)}
            />
          );
        })}
      </div>
    </div>
  );
}
