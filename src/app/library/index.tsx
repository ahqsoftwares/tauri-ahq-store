//PUB libraries
import { useEffect, useState } from "react";
import Modal from "react-modal";

//Components
import InstalledAppsMenu from "./components/Style";
import AppList from "./components/AppsList";

//tauri and updater
import { appWindow } from "@tauri-apps/api/window";
import { fetch } from "@tauri-apps/api/http";
import {
  updaterStatus,
  runManualUpdate,
} from "../resources/api/updateInstallWorker";
import server from "../server";

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
      borderRadius: "20px",
      borderWidth: "3px",
      borderColor: "hsl(var(--bc) / 0.9)",
      backgroundColor: "hsl(var(--b1) / 1)",
    },
    overlay: {
      backgroundColor: "hsl(var(--b1) / 0.8)",
      zIndex: 1000,
    },
  };

  Modal.setAppElement("body");

  fetch(`${server}apps`, {
    method: "GET",
  }).then(console.log);

  const [status, setStatus] = useState("Checking..."),
    [appList, setAppList] = useState<boolean>(false),
    [apps, setApps] = useState<string[]>([]),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [current, setCurrent] = useState<string>("");

  useEffect(() => {
    const status = updaterStatus();
    setTimeout(() => {
      setStatus(
        status.status
          ? status.status
              .replace("updated", "Check for Updates")
              .replace("updating", "Updates Available")
              .replace("checking", "Checking...")
          : "",
      );
      setApps(status.apps || []);
      setCurrent(status.updating || "");
    }, 250);

    appWindow.listen(
      "sendUpdaterStatus",
      ({ payload }: { payload: string }) => {
        const status = JSON.parse(payload);
        setStatus(
          status.status
            ? status.status
                .replace("updated", "Check for Updates")
                .replace("updating", "Updates Available")
                .replace("checking", "Checking...")
            : "",
        );
        setApps(status.totalApps || []);
        setCurrent(status.currentlyUpdating || "");
      },
    );
  }, []);

  function darkMode(classes: Array<string>) {
    let newClasses: string[] = [];

    classes.forEach((c) => {
      newClasses.push(c);
      if (dark) {
        newClasses.push(c + "-dark");
      }
    });

    return newClasses.join(" ");
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
          className={`mt-[1rem] min-w-[98%] pt-3 rounded-lg shadow-xl bg-base-200 flex flex-col`}
        >
          <div className="px-3 pt-1 flex flex-row text-center items-center justify-center mb-[1rem]">
            <h1
              className="text-base-content text-2xl"
            >
              {status === "Check for Updates"
                ? "You are up to date!"
                : status === "Checking..."
                ? "Checking for updates..."
                : status === "none"
                ? "Your apps may not be up to date!"
                : `${apps.length} update${
                    apps.length > 1 ? "s" : ""
                  } available`}
            </h1>
            <button
              className="dui-btn dui-btn-primary ml-auto my-auto"
              disabled={false}
              style={{ minWidth: "10rem", maxHeight: "30px", marginTop: "auto" }}
              onClick={() => {
                if (status === "Check for Updates" || status === "none") {
                  setStatus("Checking...");
                  setTimeout(() => {
                    runManualUpdate();
                  }, 1500);
                }
              }}
            >
              {status
                .replace("none", "Check for Updates")
                .replace("Updates Available", "Updating Apps...")}
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
