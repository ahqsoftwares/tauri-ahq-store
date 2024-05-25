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
import { getCurrent, WebviewWindow } from "@tauri-apps/api/webviewWindow";

/*Apps
 */
import Store, { AppProps } from "./app/index";
import Login, { LoginHandlerProps } from "./Login";

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
import { onAuthChange, tryAutoLogin } from "./auth/login";
import { platform } from "@tauri-apps/plugin-os";
import { Loading } from "./config/Load";

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
    console.log(ptf, "Platform");
    if (ptf == "11") {
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
    setInterval(() => loadRender(false, "Running PostInstall Script"), 10);
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
    loadRender(false, "Launching Store...");
    setTimeout(() => {
      if (!auth.currentUser) {
        StoreLoad(Login as any, { auth });
      } else {
        StoreLoad(Store, { auth });
      }
    }, 500);
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
