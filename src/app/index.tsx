/*
Native API
*/
import { useEffect, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

const appWindow = getCurrentWebviewWindow();
/*
CSS
*/
import "./index.css";

/*
Components
*/
import { Loading } from "../config/Load";
import Home from "./home/index";
import Nav from "./Nav";
import Developer from "./developer/";
import Apps from "./apps/";
import User from "./client/index";
import Library from "./library";
import Settings from "./settings/index";

import fetchPrefs, {
  appData,
  setConfig,
} from "./resources/utilities/preferences";
import { sendNotification } from "@tauri-apps/plugin-notification";
import { get_home, get_map } from "./resources/core";
import {
  defaultDark,
  defaultLight,
  isDarkTheme,
} from "./resources/utilities/themes";
import { Auth, logOut } from "../auth";
import { worker } from "./resources/core/installer";
import { runner } from "./resources/core/handler";

interface AppProps {
  auth: Auth;
}

function Render(props: AppProps) {
  runner();
  const { auth } = props;
  let [page, changePage] = useState("home"),
    [admin, setIsAdmin] = useState(false),
    [dark, setD] = useState(true),
    [theme, setTheme] = useState("synthwave"),
    [font, setFont] = useState("def"),
    [sidebar, setSidebar] = useState("flex-row"),
    [load, setLoad] = useState(false),
    [autoUpdate, setUpdate] = useState(false),
    [debug, setDebug] = useState(false),
    [apps, setApps] = useState<any>([]),
    app: JSX.Element = <></>;

  useEffect(() => {
    appWindow.emit("ready", "");
    const timer = setTimeout(() => {
      setLoad((loadStatus) => {
        if (!loadStatus) {
          window.location.reload();
        }
        return loadStatus;
      });
    }, 5 * 60 * 1000);
    appWindow.listen("launch_app", ({ payload }: { payload: string }) => {
      if (payload.startsWith("ahqstore://")) {
        const [page] = payload.replace("ahqstore://", "").split("/");

        switch (page) {
          case "login":
            changePage("user");
            break;
          case "update":
            changePage("library");
            break;
          default:
            break;
        }
      }
    });

    return () => {
      clearTimeout(timer);
    };
  }, []);
  /*
        Dark Mode
        */
  useEffect(() => {
    document.querySelector("body")?.classList.toggle("dark", dark);
    document.querySelector("html")?.setAttribute("data-theme", theme);
  }, [dark, theme]);

  useEffect(() => {
    (async () => {
      const defAccess = {
        install_apps: true,
        launch_app: true,
      };
      const fullPrefs = await fetchPrefs();

      const { autoUpdate, dark, font, debug, isAdmin, theme } = fullPrefs;

      window.prefs = {
        ...fullPrefs,
        accessPrefs: {
          ...defAccess,
          ...fullPrefs.accessPrefs,
        },
      };

      setIsAdmin(isAdmin || false);

      if (debug) {
        appWindow.listen("error", ({ payload }) => {
          sendNotification({
            title: "Info / Error / Warn",
            body: payload as any,
          });
        });
      }

      setTheme(theme);
      setD(dark);
      setFont(font);
      setUpdate(autoUpdate);
      setDebug(debug);

      //Fetch Maps
      try {
        console.log("Fetching maps...");
        const map = await get_map<{ [key: string]: Object }>();
        window.map = map;

        const home = await get_home();

        await worker.init();
        setApps(home);
        setLoad(true);
      } catch (_) {
        logOut(auth);
        console.error(_);
        //window.location.reload();
      }
    })();
  }, []);

  (async () => {
    setInterval(() => {
      const elements = document.querySelectorAll("img");

      for (let i = 0; i < elements.length; i++) {
        elements[i].setAttribute("draggable", "false");
      }
    }, 1000);
  })();

  useEffect(() => {
    const element = document.querySelector("body");
    const listedFonts = [
      "def",
      "def-v",
      "tnr",
      "geo",
      "gra",
      "ari",
      "ext",
      "bhn",
    ];

    const selectedFont = font;

    for (const font of listedFonts) {
      element?.classList.toggle(font, font === selectedFont);
    }
  }, [font]);

  function updateConfig(data: appData) {
    setConfig(data);
  }

  function changeFont(newFont: string) {
    setFont(newFont);
    updateConfig({ dark, font: newFont, autoUpdate, sidebar, debug, theme });
  }
  function setAutoUpdate(newStatus: boolean) {
    setUpdate(newStatus);
    updateConfig({ dark, font, autoUpdate: newStatus, sidebar, debug, theme });
  }
  function updateSidebar(newSidebar: string) {
    setSidebar(newSidebar);
    updateConfig({ dark, sidebar: newSidebar, font, autoUpdate, debug, theme });
  }
  function updateTheme(newTheme: string) {
    const dark = isDarkTheme(newTheme);

    setTheme(newTheme);
    setD(dark);

    updateConfig({ dark, font, autoUpdate, sidebar, debug, theme: newTheme });
  }
  function setDark(dark: boolean) {
    const theme = (() => {
      if (dark) {
        return defaultDark();
      } else {
        return defaultLight();
      }
    })();

    updateTheme(theme);
  }

  /*
        Page Selector
        */

  switch (page) {
    case "apps":
      app = <Apps auth={auth} dark={dark} apps={apps} isAdmin={admin} />;
      break;
    case "settings":
      app = (
        <Settings
          auth={auth}
          dark={dark}
          setDark={setDark}
          font={font}
          setFont={changeFont}
          autoUpdate={autoUpdate}
          setAutoUpdate={setAutoUpdate}
          sidebar={sidebar}
          setSidebar={updateSidebar}
          admin={admin}
          setTheme={updateTheme}
          theme={theme}
        />
      );
      break;
    case "user":
      app = <User auth={auth} dark={dark} setPage={changePage} />;
      break;
    case "home":
      app = (
        <Home
          auth={auth}
          dark={dark}
          dev={auth.currentUser?.dev || false}
          setPage={changePage}
        />
      );
      break;
    case "developer":
      app = <Developer auth={auth} dark={dark} />;
      break;
    case "library":
      app = <Library dark={dark} />;
      break;
  }

  return (
    <>
      {load === true ? (
        <>
          <header
            className={`pt-1 apps ${sidebar} ${sidebar.includes("flex-row-reverse") ? "pr-2" : ""
              } flex transition-all`}
          >
            <Nav
              active={page}
              home={(page: string) => changePage(page)}
              auth={auth}
            />
            <div className="bg-transparent w-screen h-[98vh]">
              <div className="flex flex-col w-[100%] h-[100%] justify-center">
                {app}
              </div>
            </div>
          </header>
        </>
      ) : (
        <Loading unsupported={false} text="Almost there!" />
      )}
    </>
  );
}

export default Render;
export type { AppProps };
