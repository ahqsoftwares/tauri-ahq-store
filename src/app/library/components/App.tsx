import { useRef } from "react";
import pkg from "../../resources/package.png";

//Icons
import { BsTrash } from "react-icons/bs";
import { IoIosNotifications } from "react-icons/io";

//API
import { appData } from "../../resources/api/fetchApps";
import Toast from "../../resources/api/toast";
import { unInstall } from "../../resources/api/updateInstallWorker";

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
  const updating = false;
  const data = useRef<HTMLDivElement>("" as any);

  async function handleClick() {
    const Toast = toast("Please wait...", "warn", "never");
    try {
      await unInstall(appInfo.id as string);
      Toast?.edit(`Successfully uninstalled ${appInfo.title}`, "success");
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
      className={`flex min-h-[4.5rem] max-h-[4.5rem] max-w-[100%] bg-base-200 text-base-content rounded-md mt-2 shadow-xl pl-2`}
    >
      <img
        width={"64px"}
        height={"64px"}
        src={appInfo.icon}
        alt={appInfo.title}
        className={`mr-2 ${appInfo.icon === pkg ? "p-2" : ""}`}
        draggable={false}
      ></img>

      <div className="flex flex-col my-auto text-start">
        <h1 className={`flex ${dark ? "text-blue-400" : "text-blue-700"}`}>
          <span className="text-2xl">{appInfo.title}</span>
          {updating ? (
            <div className={`${dark ? "text-yellow-500" : "text-yellow-900"}`}>
              <IoIosNotifications />
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

      {!updating ? (
        <div className="ml-auto mr-3 my-auto" ref={data}>
          <button
            className="flex min-w-[100%] p-4 min-h-[3.5rem] justify-center items-center text-center dui-btn dui-btn-danger text-red-700 hover:text-white hover:bg-red-700 rounded-xl transition-all"
            onClick={() => {
              handleClick();
            }}
          >
            <BsTrash size="1.5em" />
          </button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
