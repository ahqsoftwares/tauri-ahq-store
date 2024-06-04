//PUB libraries
import { useEffect, useState } from "react";

//Components
import InstalledAppsMenu from "./components/Style";
import AppList from "./components/AppsList";

//tauri and updater
import { getCurrent } from "@tauri-apps/api/webviewWindow";
import PopUp from "../resources/components/popup";

// Icons
const UpdateCheckingDark = "/update_checking_dark.png";
const UpdateCheckingLight = "/update_checking_light.png";

const UpdateLight = "/update_light.png";
const UpdateDark = "/update_dark.png";

const UpdatedLight = "/updated_light.png";
const UpdatedDark = "/updated_dark.png";

const appWindow = getCurrent();
interface LibraryProps {
  dark: boolean;
}

export default function Library(props: LibraryProps) {
  const { dark } = props;

  const [status, setStatus] = useState("Checking..."),
    [appList, setAppList] = useState<boolean>(false),
    [apps, setApps] = useState<string[]>([]),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [current, setCurrent] = useState<string>("");

  const icon = status
    .replace("Check for Updates", dark ? UpdatedDark : UpdatedLight)
    .replace("Updates Available", dark ? UpdateDark : UpdateLight)
    .replace("Checking...", dark ? UpdateCheckingDark : UpdateCheckingLight);

  useEffect(() => {
    const status = {
      status: "updated",
      apps: [],
      updating: "",
    };
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
      <PopUp shown={appList} width="95%" height="90%">
        <AppList
          dark={props.dark}
          change={() => {
            setAppList(false);
          }}
        />
      </PopUp>

      <div className={`${darkMode(["menu"])}`}>
        <div
          className={`mt-[1rem] min-w-[98%] pt-3 rounded-lg shadow-xl bg-opacity-75 bg-base-100 flex flex-col`}
        >
          <div className="px-3 pt-1 flex flex-row text-center items-center justify-center mb-[1rem]">
            <img src={icon} style={{ height: "3rem" }} />
            <h1 className="text-base-content text-2xl ml-2">
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
              style={{
                minWidth: "10rem",
                maxHeight: "30px",
                marginTop: "auto",
              }}
              onClick={() => {
                if (status === "Check for Updates" || status === "none") {
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
