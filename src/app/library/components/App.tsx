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

export default function App({
  appInfo,
  dark,
  reload,
  toast,
}: {
  appInfo: appData;
  dark: boolean;
  reload: Function;
  toast: typeof Toast;
}) {
  const updating = true;
  const data = useRef<HTMLDivElement>("" as any);

  async function handleClick() {
    const Toast = toast("Please wait...", "warn", "never");
    try {
      await unInstall(appInfo.appId as string);
      Toast?.edit(
        `Successfully uninstalled ${appInfo.appDisplayName}`,
        "success",
      );
      setTimeout(() => {
        reload();
        setTimeout(() => {
          Toast?.unmount();
        }, 2000);
      }, 125);
    } catch (e) {
      console.error(e);
      Toast?.edit(`Something might went wrong...`, "danger");
      setTimeout(() => {
        reload();
        setTimeout(() => {
          Toast?.unmount();
        }, 2000);
      }, 125);
    }
  }

  return (
    <div
      className={`flex min-h-[4.5rem] max-h-[4.5rem] max-w-[100%] bg-base-300 shadow-sm text-base-content rounded-md mt-3 pl-2`}
    >
      <img
        width="60px"
        height="60px"
        src={appInfo.icon}
        alt={appInfo.appDisplayName}
        className={`rounded-md my-auto mr-2 ${appInfo.icon === pkg ? "p-2" : ""}`}
        draggable={false}
        style={{
          "width": "60px",
          "height": "60px"
        }}
      />

      <div className="flex flex-col my-auto text-start">
        <h1 className={`flex ${dark ? "text-blue-400" : "text-blue-700"}`}>
          <span className="text-2xl">{appInfo.appDisplayName}</span>
          {updating ? (
            <div className="flex ml-2">
              <span className="text-purple-500">v</span>
              <p className="text-base-content">-{btoa(appInfo.version).substring(0, 8)}</p>
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
        {updating && <div className="ml-auto mr-3 my-auto" ref={data}>
          <button
            className="flex p-4 min-h-[3.5rem] justify-center items-center text-center dui-btn dui-btn-success cursor-default bg-base-300 text-green-700 hover:text-white hover:bg-green-700 no-animation rounded-xl transition-all app-parent"
          >
            <MdBrowserUpdated size="1.5em" />
            <p className="app-child">Updating</p>
          </button>
        </div>
        }
        {!updating && <button
          className="flex p-4 min-h-[3.5rem] justify-center items-center text-center dui-btn dui-btn-danger bg-base-300 text-red-700 hover:text-white hover:bg-red-700 rounded-xl transition-all app-parent"
            onClick={() => {
              handleClick();
            }}
          >
            <BsTrash size="1.5em" />
          <p className="app-child">Uninstall</p>
        </button>}
      </div>
    </div>
  );
}
