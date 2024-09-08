import { useRef } from "react";
import pkg from "../../resources/package.png";

//Icons
import { BsTrash } from "react-icons/bs";

//API
import { appData } from "../../resources/api/fetchApps";
import Toast from "../../resources/api/toast";
import { unInstall } from "../../resources/api/updateInstallWorker";

import "./app.css";
import { MdBrowserUpdated } from "react-icons/md";
import { Library } from "../../resources/core/installer";

interface Props {
  appInfo: appData;
  icon: string;
  dark: boolean;
  toast: typeof Toast;
  lib: Library | undefined
};

export default function App({
  appInfo,
  dark,
  icon,
  toast,
  lib
}: Props) {
  const updating = lib?.is_update;
  const data = useRef<HTMLDivElement>("" as any);

  async function handleClick() {
    toast("Uninstalling...", "warn", 3);
    await unInstall(appInfo.appId);
  }

  return (
    <div
      className={`flex min-h-[4.5rem] max-h-[4.5rem] max-w-[100%] bg-opacity-75 shadow-sm text-base-content rounded-md mt-3 pl-2`}
      style={{ "backgroundColor": "var(--fallback-bc,oklch(var(--bc)/0.2))" }}
    >
      <img
        width="60px"
        height="60px"
        src={icon}
        alt={appInfo.appDisplayName}
        className={`rounded-md my-auto mr-2 ${icon === pkg ? "p-2" : ""}`}
        draggable={false}
        style={{
          width: "60px",
          height: "60px",
        }}
      />

      <div className="flex flex-col my-auto text-start">
        <h1 className={`flex ${dark ? "text-blue-400" : "text-blue-700"}`}>
          <span className="text-2xl">{appInfo.appDisplayName}</span>
          {!updating ? (
            <div className="flex ml-2">
              <span className="text-purple-500">v</span>
              <p className="text-base-content">
                -{btoa(appInfo.version).substring(0, 8)}
              </p>
            </div>
          ) : (
            <></>
          )}
        </h1>
        <h2 className="block">
          {appInfo.description.substring(0, 64)}
          {appInfo.description.length > 64 ? "..." : ""}
        </h2>
      </div>

      <div className="ml-auto mr-3 my-auto flex" ref={data}>
        {(lib && (lib.is_update || lib.to != "Install")) && (
          <div className="ml-auto mr-3 my-auto" ref={data}>
            <button className="flex p-4 min-h-[3.5rem] justify-center items-center text-center dui-btn dui-btn-success cursor-default bg-transparent border-none text-green-700 hover:text-white hover:bg-green-700 no-animation rounded-xl transition-all app-parent">
              {updating ? <>
                <MdBrowserUpdated size="1.5em" />
                <p className="app-child">Updating</p>
              </> : <>
                <BsTrash size="1.5em" />
                <p className="app-child">Uninstalling</p>
              </>
              }
            </button>
          </div>
        )}
        {!updating && lib?.to != "Uninstall" && (
          <button
            className="flex p-4 min-h-[3.5rem] justify-center items-center text-center dui-btn dui-btn-danger bg-transparent border-none text-red-700 hover:text-white hover:bg-red-700 rounded-xl transition-all app-parent"
            onClick={() => {
              handleClick();
            }}
          >
            <BsTrash size="1.5em" />
            <p className="app-child">Uninstall</p>
          </button>
        )}
      </div>
    </div>
  );
}
