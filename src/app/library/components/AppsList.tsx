//Arrow
import { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
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

  async function parseAppsData() {
    const apps = await listAllApps();
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
        className="min-h-[auto] h-[100%] min-w-[100%] pb-[1rem]"
        style={{ overflowY: "scroll" }}
      >
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
