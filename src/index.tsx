/*Main Modules
 */
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"


/*Tauri
 */
import {
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow";

/*Apps
 */
import Store, { AppProps } from "./app/index";

const appWindow = (() => {
  try {
    return getCurrentWebviewWindow();
  } catch (_) { }
})() as WebviewWindow;

/*
 */
import { init } from "./app/resources/api/os";

/*Firebase
 */

/*Global CSS
 */
import "./index.css";
import "./globals.css";
import { loadAppVersion } from "./app/resources/api/version";
import initDeveloperConfiguration from "./app/resources/utilities/beta";
import { genAuth } from "./auth";
import { tryAutoLogin } from "./auth/login";
import { Loading } from "./config/Load";

document.body.setAttribute("native-scrollbar", "0");

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

if (localStorage.getItem("dsc-rpc") == "true") {
  invoke("dsc_rpc");
}

getCurrentWebviewWindow()
  .listen("update", () => {
    loadRender(false, "Update available, updating!");
  })
  .catch(() => { });

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
    <ContextMenu>
      <ContextMenuTrigger>
        <Loading unsupported={unsupported} text={text} />
      </ContextMenuTrigger>
    </ContextMenu>,
  );
}

if ((window as { __TAURI_INTERNALS__?: string }).__TAURI_INTERNALS__ == null) {
  loadRender(true);
} else {
  if (appWindow.label == "main") {
    initDeveloperConfiguration();

    (async () => {
      const ptf = await invoke("get_windows").catch(() => "10");

      if (ptf == "11") {
        document.querySelector("html")?.setAttribute("data-os", "win32");
      }
      setTimeout(async () => {
        appWindow.setDecorations(true).catch(console.log);

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
      setInterval(() => loadRender(false, "Oops! AHQ Store needs reinstall.."), 10);
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
    function StoreLoad(Component: (props: AppProps) => any, { auth }: AppProps) {
      const data = {
        auth,
      };

      root.render(
        <>
          <ContextMenu>
            <ContextMenuTrigger>
              <Component {...data} />
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
              <ContextMenuItem inset onClick={() => window.location.reload()}>
                Reload
              </ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  <ContextMenuItem>
                    Save Page As...
                    <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem>Create Shortcut...</ContextMenuItem>
                  <ContextMenuItem>Name Window...</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem>Developer Tools</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuContent>
          </ContextMenu>
        </>,
      );
    }

    reportWebVitals();
  } else {
    setInterval(() => {
      appWindow.setFullscreen(false);
    }, 2000);
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.querySelector("html")?.setAttribute("data-theme", "night");
    }
    document.querySelectorAll("*").forEach((v) => v.setAttribute("data-tauri-drag-region", ""))
    root.render(<ContextMenu>
      <ContextMenuTrigger><div data-tauri-drag-region className="bg-base-100 text-base-content border-base-content w-screen h-screen flex flex-col">
      <div data-tauri-drag-region className="bg-base-300 py-2 flex text-neutral-content w-full items-center text-center justify-center mb-auto">
        <img data-tauri-drag-region src="/favicon.ico" width={20} height={20} />
        <span data-tauri-drag-region className="ml-1 font-sans  font-extrabold">AHQ Store</span>
      </div>
      <div className="mb-auto flex flex-col justify-center items-center text-center">
        <h1 data-tauri-drag-region>Enter this code</h1>
        <h1 data-tauri-drag-region className="font-extrabold text-2xl">{window.location.pathname.replace("/", "")}</h1>
      </div>
      </div>
      </ContextMenuTrigger>
    </ContextMenu>);
  }
}
