import { useEffect, useRef, useState } from "react";
import pkg from "../../resources/package.png";

//Icons
import { BsThreeDotsVertical, BsTrash } from "react-icons/bs";
import { IoIosNotifications } from "react-icons/io";

//API
import { cacheData } from "../../resources/api/fetchApps";
import Toast from "../../resources/api/toast";
import {
  unInstall,
  updaterStatus,
} from "../../resources/api/updateInstallWorker";

export default function App({
  appInfo,
  dark,
  reload,
  toast,
}: {
  appInfo: cacheData;
  dark: boolean;
  reload: Function;
  toast: typeof Toast;
}) {
  const updating = updaterStatus().apps?.includes(appInfo.id);
  const [active, setActive] = useState(false);
  const data = useRef<HTMLDivElement>("" as any);

  async function handleClick() {
    const Toast = toast("Please wait...", "warn", "never");
    try {
      await unInstall(appInfo.id);
      Toast?.edit(`Successfully uninstalled ${appInfo.title}`, "success");
      setTimeout(() => {
        reload();
        setTimeout(() => {
          Toast?.unmount();
        }, 2000);
      }, 125);
    } catch (e) {
      console.log(e);
      Toast?.edit(`Something might went wrong...`, "danger");
      setTimeout(() => {
        reload();
        setTimeout(() => {
          Toast?.unmount();
        }, 2000);
      }, 125);
    }
  }

  useEffect(() => {
    if (!updating) {
      if ((data.current as any) !== "") {
        data.current.addEventListener("focusout", () => {
          setTimeout(() => {
            setActive(false);
          }, 125);
        });
        data.current.addEventListener("click", () => {
          setActive(true);
        });
      }
    }
  }, [updating]);

  return (
    <div
      className={`flex min-h-[4.5rem] max-h-[4.5rem] max-w-[100%] ${
        dark ? "bg-gray-800 text-white" : "bg-gray-100 text-slate-800"
      } rounded-md mt-2 shadow-xl`}
    >
      <img
        width={"64px"}
        height={"64px"}
        src={appInfo.img}
        alt={appInfo.title}
        className={appInfo.img === pkg ? "p-2" : ""}
        draggable={false}
      ></img>

      <div className="flex flex-col my-auto">
        <h1
          className={`block text-2xl ${
            dark ? "text-blue-400" : "text-blue-700"
          }`}
        >
          {appInfo.title}
        </h1>
        <h2 className="block">{appInfo.description}</h2>
      </div>

      {updating ? (
        <div className="mt-2 text-yellow-500">
          <IoIosNotifications />
        </div>
      ) : (
        <></>
      )}

      {!updating ? (
        <div className="ml-auto mr-3 my-auto" ref={data}>
          <button
            className={`p-2 ${
              active ? (dark ? "bg-gray-900" : "bg-gray-200") : ""
            } ${
              !active ? (dark ? "hover:bg-black" : "hover:bg-gray-300") : ""
            } rounded-md`}
            style={{ transition: "all 120ms linear" }}
          >
            <BsThreeDotsVertical />
          </button>
          {active ? (
            <div
              className={`mt-1 absolute ${
                dark ? "bg-gray-900" : "bg-gray-300"
              } min-h-[1rem] min-w-[6rem] rounded-xl shadow-xl`}
              style={{
                right: "2rem",
              }}
            >
              <button
                className="flex w-[100%] h-[3rem] justify-center items-center text-center text-red-700 hover:text-white hover:bg-red-700 rounded-xl"
                onClick={() => {
                  handleClick();
                }}
              >
                <BsTrash size="1.5em" /> Uninstall
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
