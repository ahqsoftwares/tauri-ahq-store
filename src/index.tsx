/*Main Modules
 */
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

/*Tauri
 */
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";
import { register, unregisterAll } from "@tauri-apps/api/globalShortcut";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { resolveResource } from "@tauri-apps/api/path";

/*Apps
 */
import App from "./config/App";
import Store, { AppProps } from "./app/index";
import Login, { LoginHandlerProps } from "./Login";

//2nd Screen
import SecondApp from "./complement/app";
import SecondLogin from "./complement/login";

/*
 */
import { init } from "./app/resources/api/os";

/*Firebase
 */

/*Global CSS
 */
import "./index.css";
import { loadAppVersion } from "./app/resources/api/version";
import initDeveloperConfiguration from "./app/resources/utilities/beta";
import { genAuth } from "./auth";
import { onAuthChange, tryAutoLogin } from "./auth/login";
import { os } from "@tauri-apps/api";

const auth = genAuth();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

let list = [
  "F5", //Reload
  "CommandOrControl+R", //Reload
  "CommandOrControl+Shift+R", //Reload
  "CommandOrControl+Shift+E", //Find
  "CommandOrControl+Shift+X", //Useless Screenshot
  "CommandOrControl+F", //Find
  "CommandOrControl+G", //Find
  "CommandOrControl+Shift+G", //Find
  "CommandOrControl+P", //Print
  "CommandOrControl+Shift+P", //Print
  "CommandOrControl+U", //Inspect Page
];

/**
 * Loads updater
 * @param {string} state
 * @param {React.Component} App
 */
function render(state: string, App: (props: { info: string }) => JSX.Element) {
  root.render(
    <>
      <App info={state} />
    </>,
  );
}

if (window.__TAURI_IPC__ == null) {
  render("Not Ready", App);
} else {
  initDeveloperConfiguration();

  /**Sub or main? */
  if (appWindow.label === "main") {
    // invoke("set_overlay", {
    //   set: true,
    // });
    (async () => {
      if ((await os.platform()) == "win32") {
        document.querySelector("html")?.setAttribute("data-os", "win32");
      }
      setTimeout(() => {
        appWindow.setDecorations(true);
      }, 500);
    })();
    appWindow.onFocusChanged(({ payload: focused }) => {
      if (focused) {
        list.forEach((item) => {
          register(item, () => {}).catch(() => {});
        });
      } else if (appWindow.label === "main") {
        unregisterAll().catch(() => {});
      }
    });

    appWindow.show();
    loadAppVersion();
    init();

    const unlisten = appWindow.listen("needs_reinstall", () => {
      unlisten.then((f) => f());
      setInterval(() => render("Running PostInstall Script", App), 10);
    });

    /*Logic
     */
    (async () => {
      let permissionGranted = await isPermissionGranted();

      appWindow.emit("ready", "");

      if (!(await appWindow.isMaximized())) {
        appWindow.maximize();
      }

      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === "granted";
      }
    })();

    render("Welcome!", App);

    (async () => {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      await delay(2000);

      Manage();
    })();

    window.addEventListener("offline", () => {
      render("Offline, waiting for network", App);
    });

    window.addEventListener("online", () => {
      render("Online!", App);
      setTimeout(() => {
        Manage();
      }, 3000);
    });

    async function Manage() {
      onAuthChange(auth, async (user) => {
        const lastEmailSent = Number(
          localStorage.getItem("last_email_sent") || "0",
        );

        if (
          user &&
          !user.e_verified &&
          Date.now() > lastEmailSent + 24 * 60 * 60 * 1000
        ) {
          localStorage.setItem("last_email_sent", Date.now().toString());

          sendNotification({
            title: "Email Verification",
            body: "Email verification link send! Please verify",
          });
        }

        const pwd = await invoke("decrypt", {
          encrypted: JSON.parse(
            localStorage.getItem("password") || "[]",
          ) as number[],
        }).catch(() => "a");

        if (!(localStorage.getItem("email") && pwd != "a")) {
          console.log("Signing out");
        }

        user ? StoreLoad(Store, { auth }) : StoreLoad(Login as any, { auth });
      });

      await tryAutoLogin(auth);
      render("Launching Store...", App);
      setTimeout(() => {
        if (!auth.currentUser) {
          StoreLoad(Login as any, { auth });
        } else {
          StoreLoad(Store, { auth });
        }
      }, 1000);
    }

    /**
     * Load a Store Component on the DOM
     * @param Component
     * @param prop
     */
    function StoreLoad(
      Component: (props: LoginHandlerProps | AppProps) => any,
      { auth }: AppProps,
    ) {
      const data = {
        auth,
      };

      root.render(
        <>
          <Component {...data} />
        </>,
      );
    }

    reportWebVitals();
  } else {
    let dataHolder: string;

    appWindow
      .listen("app", ({ payload }: { payload: string }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, __, path, data] = payload.split("/");
        dataHolder = data;

        if (path === "app") {
          if (!auth.currentUser) {
            unload();
          } else {
            load();
          }
          appWindow.unminimize();
          appWindow.show();
        } else {
          unregisterAll().catch(() => {});
          appWindow.emit("activate", "");
        }
      })
      .then(() => {
        appWindow.emit("ready", "");
      });

    onAuthChange(auth, (user) => {
      if (user && localStorage.getItem("password")) {
        load();
      } else {
        unload();
      }
    });

    function load() {
      root.render(<SecondApp appId={dataHolder} />);
    }

    function unload() {
      root.render(<SecondLogin />);
    }
  }
}
