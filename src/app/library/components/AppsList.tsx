//Arrow
import { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { GiPartyPopper } from "react-icons/gi";
import fetchApps, { cacheData } from "../../resources/api/fetchApps";
import Toast from "../../resources/api/toast";
import listAllApps from "../../resources/utilities/listAllApps";
import App from "./App";

interface Props {
  dark: boolean;
  change: Function;
}

export default function AppsList(props: Props) {
  const { dark, change } = props;

  const [apps, setApps] = useState<cacheData[]>([]);
  const [rawApps, setRawApps] = useState(0);

  async function parseAppsData() {
    const apps = await listAllApps();
    if (Object.keys(apps).length === 0) {
      setRawApps(1);
    }
    const resolvedApps = await fetchApps(Object.keys(apps));
    setApps(resolvedApps as cacheData[]);
  }

  useEffect(() => {
    parseAppsData();
  }, []);

  return (
    <div className="flex flex-col w-[100%] h-[100%]">
      <div className={`flex ${dark ? "text-slate-300" : "text-slate-800"}`}>
        <button
          onClick={() => change()}
          className={`rounded-md p-1 ${
            dark ? "hover:bg-gray-900" : "hover:bg-white"
          }`}
          style={{ transition: "all 250ms linear" }}
        >
          <BiArrowBack size="1.5em" />
        </button>
      </div>
      <div
        className="min-h-[auto] h-[100%] min-w-[100%] pb-[1rem] text-center"
        style={{ overflowY: "scroll" }}
      >
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
          <h1 className={`my-2 ${dark ? "text-slate-400" : "text-slate-700"}`}>
            Loading...
          </h1>
        ) : (
          <></>
        )}

        {apps.map((data) => {
          return (
            <App
              key={data.id}
              appInfo={data}
              dark={dark}
              reload={parseAppsData}
              toast={Toast}
            />
          );
        })}
      </div>
    </div>
  );
}
