/*
Native API
*/
import { useEffect, useState } from "react";
import fetch from "./resources/core/http";
import { appWindow } from "@tauri-apps/api/window";
/*
Firebase
*/
import { Auth } from "firebase/auth";

/*
CSS
*/
import "./index.css";

/*
Components
*/
import Loading from "../config/App";
import Home from "./home/index";
import Nav from "./Nav";
import Developer from "./developer/";
import Apps from "./apps/";
import User from "./client/index";
import Library from "./library";
import Settings from "./settings/index";

import BaseAPI, { newServer } from "./server";

import fetchPrefs, {
  appData,
  setConfig,
} from "./resources/utilities/preferences";
import { runner } from "./resources/core/handler";
import { init } from "./resources/api/fetchApps";
import { notification } from "@tauri-apps/api";
import { Prefs } from "./resources/core";
import {
  defaultDark,
  defaultLight,
  isDarkTheme,
} from "./resources/utilities/themes";

interface AppProps {
  data: {
    auth: Auth;
  };
}

function Render(props: AppProps) {
  runner();

  const { auth } = props.data;
  let [page, changePage] = useState("home"),
    [dev, setDev] = useState(
      auth.currentUser?.displayName?.startsWith("(dev)"),
    ),
    [admin, setIsAdmin] = useState(false),
    [prefs, setAccessPrefs] = useState<Prefs>({
      install_apps: false,
      launch_app: false,
    }),
    [dark, setD] = useState(true),
    [theme, setTheme] = useState("synthwave"),
    [font, setFont] = useState("def"),
    [sidebar, setSidebar] = useState("flex-row"),
    [load, setLoad] = useState(false),
    [autoUpdate, setUpdate] = useState(false),
    [debug, setDebug] = useState(false),
    [apps, setApps] = useState<any>([]),
    [allAppsData, setData] = useState<{ map: { [key: string]: Object } }>({
      map: {},
    }),
    App: any = () => <></>;

  useEffect(() => {
    appWindow.listen("app", ({ payload }: { payload: string }) => {
      if (payload.startsWith("ahqstore://")) {
        const [page] = payload.replace("ahqstore://", "").split("/");

        switch (page) {
          case "app":
            changePage("apps");
            break;
          case "update":
            changePage("apps");
            break;
          default:
            break;
        }
      }
    });
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

      const {
        autoUpdate,
        dark,
        font,
        sidebar,
        debug,
        accessPrefs,
        isAdmin,
        theme,
      } = fullPrefs;

      (window as any).prefs = {
        ...fullPrefs,
        accessPrefs: {
          ...defAccess,
          ...fullPrefs.accessPrefs,
        },
      };

      setAccessPrefs(accessPrefs || defAccess);

      setIsAdmin(isAdmin || false);

      if (debug) {
        appWindow.listen("error", ({ payload }) => {
          notification.sendNotification({
            title: "Info / Error / Warn",
            body: payload as any,
          });
        });
      }

      setTheme(theme);
      setD(dark);
      setFont(font);
      setUpdate(autoUpdate);
      setSidebar(sidebar);
      setDebug(debug);

      //Fetch Maps
      init()
        .then(async (commit_id) => {
          if (
            commit_id !== "" ||
            commit_id !== undefined ||
            commit_id !== null
          ) {
            const { data: Mapped } = await fetch<any>(
              `${newServer}/apps/map`,
              {
                method: "GET",
                timeout: 30,
                responseType: 1,
              },
            );

            setData({
              map: Mapped as {
                [key: string]: Object;
              },
            });

            const { data: Home } = await fetch<any>(
              `${newServer}/apps/home`,
              {
                method: "GET",
                timeout: 30,
                responseType: 1,
              },
            );

            setApps(Home);
          }
          setLoad(true);
        })
        .catch(() => {
          window.location.reload();
        });
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
      App = Apps;
      break;
    case "settings":
      App = Settings;
      break;
    case "user":
      App = User;
      break;
    case "home":
      App = Home;
      break;
    case "developer":
      App = Developer;
      break;
    case "library":
      App = Library;
      break;
  }

  /*
        App renderer
        */

  return (
    <>
      {load === true ? (
        <header
          className={`apps${dark ? "-d" : ""} ${sidebar} ${
            sidebar.includes("flex-row-reverse") ? "pr-2" : ""
          } flex transition-all`}
        >
          <Nav
            active={page}
            home={(page: string) => changePage(page)}
            dev={dev}
            horizontal={sidebar.includes("flex-col")}
          />
          <div className={`w-screen h-screen`}>
            <div className="flex flex-col w-[100%] h-[100%] justify-center">
              <App
                baseApi={BaseAPI}
                auth={auth}
                setDev={setDev}
                dark={dark}
                setDark={setDark}
                font={font}
                setFont={changeFont}
                apps={apps}
                setApps={setApps}
                allAppsData={allAppsData}
                autoUpdate={autoUpdate}
                setAutoUpdate={setAutoUpdate}
                setPage={changePage}
                dev={dev}
                sidebar={sidebar}
                setSidebar={updateSidebar}
                admin={admin}
                isAdmin={admin}
                accessPrefs={prefs}
                theme={theme}
                setTheme={updateTheme}
              />
            </div>
          </div>
        </header>
      ) : (
        <Loading info="Almost there!" />
      )}
    </>
  );
}

export default Render;
