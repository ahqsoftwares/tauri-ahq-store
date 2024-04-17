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
} from "@tauri-apps/plugin-notification";
import { invoke } from "@tauri-apps/api/core";
import { getCurrent } from "@tauri-apps/api/webviewWindow";

/*Apps
 */
import App from "./config/App";
import Store, { AppProps } from "./app/index";
import Login, { LoginHandlerProps } from "./Login";

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
import { platform } from "@tauri-apps/plugin-os";
import { Loading } from "./config/Load";

const appWindow = getCurrent();
const auth = genAuth();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

let list = [
  [false, false, "F5"], //Reload
  [true, false, "R"], //Reload
  [true, true, "R"], //Reload
  [true, true, "E"], //Find
  [true, true, "X"], //Useless Screenshot
  [true, false, "F"], //Find
  [true, false, "G"], //Find
  [true, false, "G"], //Find
  [true, false, "P"], //Print
  [true, true, "P"], //Print
  [true, false, "U"], //Inspect Page
];

window.addEventListener("keydown", (e) => {
  list.forEach(([ct, sh, key]) => {
    if (e.ctrlKey == ct && e.shiftKey == sh && e.key == key) {
      e.preventDefault();
    }
  });
});

/**
 * Loads updater
 */
function loadRender(unsupported: boolean) {
  root.render(
    <>
      <Loading unsupported={unsupported} />
    </>,
  );
}

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

if ((window as { __TAURI_INTERNALS__?: string }).__TAURI_INTERNALS__ == null) {
  loadRender(true);
} else {
  initDeveloperConfiguration();

  (async () => {
    const ptf = await platform();
    console.log(ptf, "Platform");
    if (ptf == "windows") {
      document.querySelector("html")?.setAttribute("data-os", "win32");
    }
    setTimeout(() => {
      console.log("Decorations: true");
      appWindow.setDecorations(true).catch(console.log).then(console.log);
    }, 500);
  })();

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

  loadRender(false);

  (async () => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    await delay(20 * 1000);

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

    await tryAutoLogin(auth).catch(() => {});
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
}
