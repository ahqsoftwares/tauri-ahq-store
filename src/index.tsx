/*Main Modules
 */
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

/*Tauri
 */
import {
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification";
import { invoke } from "@tauri-apps/api/core";
import { getCurrent, WebviewWindow } from "@tauri-apps/api/webviewWindow";

/*Apps
 */
import Store, { AppProps } from "./app/index";

const appWindow = (() => {
  try { return getCurrent(); } catch (_) { }
})() as WebviewWindow;

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
import { tryAutoLogin } from "./auth/login";
import { Loading } from "./config/Load";

document.body.setAttribute('native-scrollbar', "0");

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
  [true, true, "B"], // Favourites
  [true, false, "S"], //Save
];

getCurrent().listen("update", () => {
  loadRender(false, "Update available, updating!");
}).catch(() => { });

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
function loadRender(unsupported: boolean, text = "Loading") {
  root.render(
    <>
      <Loading unsupported={unsupported} text={text} />
    </>,
  );
}

if ((window as { __TAURI_INTERNALS__?: string }).__TAURI_INTERNALS__ == null) {
  loadRender(true);
} else {
  initDeveloperConfiguration();

  (async () => {
    const ptf = await invoke("get_windows").catch(() => "10");

    if (ptf == "11") {
      document.querySelector("html")?.setAttribute("data-os", "win32");
    }
    setTimeout(async () => {
      appWindow.setDecorations(true).catch(console.log).then(console.log);

      appWindow.show();
      if (!(await appWindow.isMaximized())) {
        appWindow.maximize();
      }
    }, 500);
  })();
  loadAppVersion();
  init();

  const unlisten = appWindow.listen("needs_reinstall", () => {
    unlisten.then((f) => f());
    setInterval(() => loadRender(false, "Running PostInstall Script"), 10);
  });

  /*Logic
   */
  (async () => {
    let permissionGranted = await isPermissionGranted();

    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }
  })();

  loadRender(false);

  (async () => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    await delay(1000);

    Manage();
  })();

  window.addEventListener("offline", () => {
    loadRender(false, "Offline, waiting for network");
  });

  window.addEventListener("online", () => {
    loadRender(false, "Back online!");
    setTimeout(() => {
      Manage();
    }, 1000);
  });

  async function Manage() {
    tryAutoLogin(auth).catch(() => { });
    loadRender(false, "Launching Store...");
    setTimeout(() => {
      StoreLoad(Store, { auth });
    }, 500);
  }

  /**
   * Load a Store Component on the DOM
   * @param Component
   * @param prop
   */
  function StoreLoad(
    Component: (props: AppProps) => any,
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