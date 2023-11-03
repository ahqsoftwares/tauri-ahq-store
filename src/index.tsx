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
import { resolveResource } from '@tauri-apps/api/path';

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
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  onAuthStateChanged,
} from "firebase/auth";

/*Global CSS
 */
import "./index.css";
import { loadAppVersion } from "./app/resources/api/version";
import initDeveloperConfiguration from "./app/resources/utilities/beta";
import { getVersion } from "@tauri-apps/api/app";

type GitHubAsset = { name: string; browser_download_url: string };

const config = {
  apiKey: "AIzaSyAXAkoxKG4chIuIGHPkVG8Sma9mTJqiC84",
  authDomain: "ahq-store.firebaseapp.com",
  databaseURL: "https://ahq-store-default-rtdb.firebaseio.com",
  projectId: "ahq-store",
  storageBucket: "ahq-store.appspot.com",
  messagingSenderId: "460016490107",
  appId: "1:460016490107:web:50123c20ca44ccee3b74de",
  measurementId: "G-TEZS1Y48L1",
};

const app = initializeApp(config);
const auth = getAuth(app);

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

resolveResource("icons/pwd_reset.png").then((icon) => {
  sendNotification({
    title: "HI",
    icon
  });
});

if (window.__TAURI_IPC__ == null) {
  render("Not Ready", App);
} else {
  initDeveloperConfiguration();

  /**Sub or main? */
  if (appWindow.label === "main") {
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
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      await delay(2000);

      Manage();
    })()

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
      render("Launching Store...", App);
      setTimeout(() => {
        if (!auth.currentUser) {
          StoreLoad(Login as any, { auth });
        } else {
          StoreLoad(Store, { auth });
        }

        if (auth.currentUser && !auth.currentUser?.emailVerified) {
          sendEmailVerification(auth.currentUser).catch(() => {});
          sendNotification({
            title: "Email Verification",
            body: "Email verification link send! Please verify",
          });
        }

        auth.onAuthStateChanged(async (user) => {
          if (user && !user.emailVerified) {
            sendEmailVerification(user).catch(() => {});
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
            auth.signOut();
          }
          user
            ? StoreLoad(Store, { auth })
            : StoreLoad(Login as any, { auth });
        });
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
        create: createUserWithEmailAndPassword,
        login: signInWithEmailAndPassword,
        resetEmail: sendPasswordResetEmail,
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

    onAuthStateChanged(auth, (user) => {
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
