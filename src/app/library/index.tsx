//PUB libraries
import { useEffect, useState } from "react";
import Modal from "react-modal";

//Components
import InstalledAppsMenu from "./components/Style";
import AppList from "./components/AppsList";

//tauri and updater
import { appWindow } from "@tauri-apps/api/window";
import { updaterStatus, runManualUpdate } from "../resources/api/updateInstallWorker";

interface LibraryProps {
  dark: boolean;
}

export default function Library(props: LibraryProps) {
  const { dark } = props;

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "95%",
      height: "90%",
      transition: "all 500ms linear",
      backgroundColor: props.dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
      borderColor: props.dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
    },
    overlay: {
      backgroundColor: !props.dark
        ? "rgb(55, 65, 81, 0.5)"
        : "rgb(107, 114, 128, 0.75)",
    },
  };

  Modal.setAppElement("body");

  const [status, setStatus] = useState("Checking..."),
    [appList, setAppList] = useState<boolean>(false),
    [apps, setApps] = useState<string[]>([]),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [current, setCurrent] = useState<string>("");

  useEffect(() => {
    const status = updaterStatus();
    setTimeout(() => {
      setStatus(status.status ? status.status.replace("updated", "Check for Updates").replace("updating", "Updates Available").replace("checking", "Checking...") : "");
      setApps(status.apps || []);
      setCurrent(status.updating || "");
    }, 250);

    appWindow.listen("sendUpdaterStatus", ({ payload }: {payload: string}) => {
      const status = JSON.parse(payload);
      setStatus(status.status ? status.status.replace("updated", "Check for Updates").replace("updating", "Updates Available").replace("checking", "Checking...") : "");
      setApps(status.totalApps || []);
      setCurrent(status.currentlyUpdating || "");
    });
  }, []);

  function darkMode(classes: Array<string>) {
    return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
  }

  return (
    <>
      <Modal isOpen={appList} style={customStyles}>
        <AppList
          dark={props.dark}
          change={() => {
            setAppList(false);
          }}
        />
      </Modal>

      <div className={`${darkMode(["menu"])}`}>
        <div
          className={`mt-[1rem] min-w-[98%] rounded-lg shadow-xl ${
            dark ? "bg-gray-800" : "bg-gray-100"
          } flex flex-col`}
        >
          <div className="px-3 pt-1 flex flex-row text-center items-center justify-center mb-[1rem]">
            <h1
              className={`${
                dark ? "text-slate-200" : "text-slate-800"
              } text-2xl`}
            >
              {status === "Check for Updates" ? "You are up to date!" : status === "Checking..." ? "Checking for updates..." : status === "none" ? "Your apps may not be up to date!" : `${apps.length} update${apps.length > 1 ? "s" : ""} available`}
            </h1>
            <button
              className="button ml-auto"
              disabled={status !== "Check for Updates" && status !== "none"}
              style={{ maxWidth: "10rem", maxHeight: "30px" }}
              onClick={() => {
                if (status === "Check for Updates" || status === "none") {
                  setStatus("Checking...");
                  setTimeout(() => {
                    runManualUpdate();
                  }, 1500);
                }
              }}
            >
              {status.replace("none", "Check for Updates").replace("Updates Available", "Updating Apps...")}
            </button>
          </div>
        </div>
        <InstalledAppsMenu
          dark={props.dark}
          onClick={() => {
            setAppList(true);
          }}
        />
        <div className="mb-[1.5rem]"></div>
      </div>
    </>
  );
}
