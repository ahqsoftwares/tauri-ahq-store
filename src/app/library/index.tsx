//PUB libraries
import { useEffect, useState } from "react";

//Components
import AppList from "./components/AppsList";
import { Library, worker } from "../resources/core/installer";

// Icons
const UpdateCheckingDark = "/update_checking_dark.png";
const UpdateCheckingLight = "/update_checking_light.png";

const UpdateLight = "/update_light.png";
const UpdateDark = "/update_dark.png";

const UpdatedLight = "/updated_light.png";
const UpdatedDark = "/updated_dark.png";

interface LibraryProps {
  dark: boolean;
}

export default function LibraryComponent(props: LibraryProps) {
  const { dark } = props;

  const [apps, setApps] = useState<Library[]>(worker.library),
    [update, setUpdate] = useState(worker.update),
    [until, setUntil] = useState(false);

  const icon = (() => {
    switch (update) {
      case "Checking":
        return dark ? UpdateCheckingDark : UpdateCheckingLight;

      case "Updating":
        return dark ? UpdateCheckingDark : UpdateCheckingLight;

      case "Disabled":
        return dark ? UpdateDark : UpdateLight;

      case "UpToDate":
        return dark ? UpdatedDark : UpdatedLight;
    }
  })();

  useEffect(() => {
    const id = worker.listen((lib, upd) => {
      setApps(lib);
      setUpdate(upd);
      setUntil(false);
    });

    return () => worker.unlisten(id);
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
      <div className={`${darkMode(["menu"])}`}>
        <div
          className={`mt-[1rem] min-w-[98%] pt-3 rounded-lg shadow-xl bg-opacity-75 bg-base-100 flex flex-col`}
        >
          <div className="px-3 pt-1 flex flex-row text-center items-center justify-center mb-[1rem]">
            <img src={icon} style={{ height: "3rem" }} />
            <h1 className="text-base-content text-2xl ml-2">
              {update === "UpToDate"
                ? "You are up to date!"
                : update === "Checking"
                  ? "Checking for updates..."
                  : update === "Disabled"
                    ? "Your apps may not be up to date!"
                    : `${Math.round(apps.length / 2)} update${
                        apps.length > 1 ? "s" : ""
                    } available & are installing`}
            </h1>
            <button
              className="dui-btn dui-btn-primary ml-auto my-auto"
              disabled={until}
              style={{
                minWidth: "10rem",
                maxHeight: "30px",
                marginTop: "auto",
              }}
              onClick={() => {
                if (update == "UpToDate" || update == "Disabled") {
                  worker.runUpdate();
                  setUntil(true);
                }
              }}
            >
              {update
                .replace("Disabled", "Check for Updates")
                .replace("UpToDate", "Check for Updates")}
            </button>
          </div>
        </div>
        <AppList dark={props.dark} library={apps} />
      </div>
    </>
  );
}
