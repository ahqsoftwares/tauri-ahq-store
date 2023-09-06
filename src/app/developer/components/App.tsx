import { useRef } from "react";
import pkg from "../../resources/package.png";

//Icons
import { MdModeEdit } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";

//API
import { appData } from "../../resources/api/fetchApps";
import Toast from "../../resources/api/toast";

export default function App({
  appInfo,
  dark,
  toast,
  lastIndex,
}: {
  appInfo: appData;
  dark: boolean;
  toast: typeof Toast;
  lastIndex: boolean;
}) {
  const updating = false;
  const data = useRef<HTMLDivElement>("" as any);

  async function handleClick() {
    toast("Coming soon", "warn", 1);
  }

  return (
    <div
      className={`mx-2 rounded-md my-1 flex min-h-[4.5rem] max-h-[4.5rem] max-w-[100%] ${
        dark ? "bg-gray-800 text-white" : "bg-gray-100 text-slate-800"
      } ${lastIndex ? "rounded-b-md" : ""} hover:shadow-xl pl-2 cursor-default`}
    >
      <img
        width={"64px"}
        height={"64px"}
        src={appInfo.icon}
        alt={appInfo.title}
        className={`mr-2`}
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
            className="flex min-w-[100%] p-4 min-h-[3rem] justify-center items-center text-center text-blue-800 hover:text-white hover:bg-blue-800 rounded-xl transition-all cursor-pointer"
            onClick={() => {
              handleClick();
            }}
          >
            <MdModeEdit size="1.5em" />
          </button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
