import { useState, useEffect, useRef } from "react";

//Worker
import { BiArrowBack } from "react-icons/bi";
import Modal from "react-modal";
import fetchApps, { appData } from "../../resources/api/fetchApps";

//AHQ Store Installer
import {
  isInstalled,
  updaterStatus,
} from "../../resources/api/updateInstallWorker";
import installWorker from "../../resources/classes/installWorker";
import { install_app } from "../../resources/core";

interface AppDataPropsModal {
  shown: boolean;
  change: Function;
  dark: Boolean;
  installData: any;
  isAdmin: boolean;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const defAppData = {
  icon: "",
  title: "",
  description: "",
  author: "",
  displayName: "",
  download: "",
  exe: "",
  id: "",
  repo: {
    author: "",
    repo: "",
  },
  version: "",
};

export default function ShowModal(props: AppDataPropsModal) {
  const { shown, dark, change, installData, isAdmin } = props;

  const {
    accessPrefs: { install_apps },
  } = (window as any).prefs as { accessPrefs: { install_apps: boolean } };

  const [appData, setAppData] = useState<appData>(defAppData);
  const [working, setWorking] = useState(false);
  const button = useRef<HTMLButtonElement>("" as any);
  const [installed, setInstalled] = useState<boolean | "hidden">(false);
  const [updating, setUpdating] = useState(true);

  useEffect(() => {
    setAppData(defAppData);
    setInstalled("hidden");
    (async () => {
      if ((installData || "") !== "") {
        setAppData((await fetchApps(installData)) as any);
        setInstalled(await isInstalled(installData));

        setUpdating(
          updaterStatus().apps?.includes(installData) === true ? true : false,
        );
      }
    })();
  }, [installData]);

  const { icon, title, description, AuthorObject } = appData;

  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "95%",
      height: "90%",
      transition: "all 0.5s linear",
      borderRadius: "20px",
      borderColor: dark ? "rgb(30, 41, 59)" : "rgb(209, 213, 219)",
      backgroundColor: dark ? "rgb(30, 41, 59)" : "rgb(209, 213, 219)",
    },
    overlay: {
      backgroundColor: !dark
        ? "rgb(55, 65, 81, 0.5)"
        : "rgb(107, 114, 128, 0.75)",
      opacity: "1",
      zIndex: 1000,
    },
  };
  Modal.setAppElement("body");

  return (
    <Modal isOpen={shown} contentLabel={"App Information"} style={modalStyles}>
      <div className="flex flex-col w-[100%] h-[100%]">
        <div className={`flex ${dark ? "text-slate-300" : "text-slate-800"}`}>
          <button
            onClick={() => {
              if (!working) {
                change();
              }
            }}
            className={`rounded-md p-1 ${
              !working ? (dark ? "hover:bg-gray-600" : "hover:bg-white") : ""
            }`}
            style={{ transition: "all 250ms linear" }}
          >
            <BiArrowBack size="1.5em" />
          </button>
        </div>
        <div className="flex w-[100%] h-[100%]">
          <div
            className={`w-[40%] flex flex-col items-center rounded-xl shadow-xl mt-2`}
          >
            <img
              width={128}
              height={128}
              src={icon}
              alt="Logo"
              className="rounded-3xl shadow-2xl"
            ></img>

            <h1
              className={`mt-5 text-3xl ${
                dark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {title}
            </h1>

            <div className="w-[95%] mt-3 mb-auto">
              <h2
                className={`text-2xl text-center ${
                  dark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {description}
              </h2>
            </div>

            {isAdmin || install_apps ? (
              installed == "hidden" ? (
                <button
                  ref={button}
                  className="dui-btn btn-info w-[60%] mb-4"
                  style={{
                    backgroundColor: "transparent",
                    color: dark ? "white" : "black",
                    fontFamily: "inherit",
                    border: `2px ${dark ? "white" : "black"} solid`,
                  }}
                  disabled={true}
                >
                  <span className="dui-loading dui-loading-spinner"></span>
                  Loading
                </button>
              ) : installed ? (
                <button
                  ref={button}
                  className="dui-btn dui-btn-error w-[60%] mb-4"
                  style={{
                    color: "white",
                  }}
                  disabled={updating}
                  onClick={async () => {
                    if (!working) {
                      setWorking(true);
                      button.current.innerHTML = "Uninstalling...";

                      await new installWorker((_) => {}).uninstall(installData);

                      button.current.innerHTML = "Uninstalled!";

                      setTimeout(async () => {
                        setInstalled(await isInstalled(installData));
                        setWorking(false);
                      }, 1000);
                    }
                  }}
                >
                  Uninstall
                </button>
              ) : (
                <button
                  ref={button}
                  className="dui-btn dui-btn-success text-success-content w-[60%] mb-4"
                  onClick={async () => {
                    if (!working) {
                      setWorking(true);

                      button.current.innerHTML = "Starting Download...";

                      await install_app(installData, (c, t) => {
                        if (c == 10000 && t == 0) {
                          button.current.innerHTML = "Installing...";
                        } else {
                          button.current.innerHTML = `${Math.round(
                            (c * 100) / t,
                          )}% of ${formatBytes(t)}`;
                        }
                      }).then(async (data: any) => {
                        console.log(data);
                        if (data != "[]") {
                          button.current.innerHTML = "Failed...";
                        } else {
                          button.current.innerHTML = "Installed!";
                        }

                        setInstalled(await isInstalled(installData));
                        setWorking(false);
                      });
                    }
                  }}
                >
                  Install
                </button>
              )
            ) : (
              <button className="dui-btn dui-btn-error text-white bg-red-700 hover:bg-red-700 border-red-700 hover:border-red-700 w-[60%] mb-4">
                No Permission
              </button>
            )}
          </div>

          <div
            className={`${
              dark ? "text-slate-200" : "text-slate-800"
            } p-4 ml-2 w-[100%] rounded-xl shadow-xl flex flex-col`}
          >
            {/*"Images (soon)"*/}
            <div></div>

            {/*Author*/}
            <div className="w-[100%]">
              <h1 className="text-xl">About Developer</h1>
              <h2 className="text-lg">{AuthorObject?.displayName}</h2>
            </div>

            {/*Ratings (soon)*/}
            <div></div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
