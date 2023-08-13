import {
  BaseDirectory,
  createDir,
  readTextFile,
  writeFile,
} from "@tauri-apps/api/fs";

import { sendNotification } from "@tauri-apps/api/notification";

import { Prefs, get_access_perfs } from "../core";
import { invoke } from "@tauri-apps/api/tauri";
import { notification } from "@tauri-apps/api";
import { exit } from "@tauri-apps/api/process";
import { isDarkTheme } from "./themes";

interface appData {
  theme: string;
  dark: boolean;
  font: string;
  autoUpdate: boolean;
  sidebar: string;
  debug: boolean;
  accessPrefs?: Prefs;
  isAdmin?: boolean;
}

export type { appData };

export default async function fetchPrefs(): Promise<appData> {
  createDir("", { dir: BaseDirectory.App }).catch((e) => e);
  createDir("database", { dir: BaseDirectory.App }).catch((e) => e);

  const is_admin = await invoke<boolean>("is_an_admin");
  const prefs = await get_access_perfs();

  if (!is_admin && !prefs.launch_app) {
    notification.sendNotification({
      title: "Denied",
      body: "You are not allowed to launch the app!",
    });

    await exit(1);
  }

  const mode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const defTheme = mode ? "synthwave" : "winter";

  return await readTextFile("database/config.astore", {
    dir: BaseDirectory.App,
  })
    .then((data) => JSON.parse(data) as appData | undefined)
    .then(
      (data) =>
        ({
          theme: defTheme,
          font: "def",
          autoUpdate: false,
          debug: false,

          ...data,

          dark: isDarkTheme(data?.theme || defTheme),
          accessPrefs: prefs,
          isAdmin: is_admin,
        }) as appData,
    )
    .catch(async (e) => {
      console.log(e);
      await createDir("database", { dir: BaseDirectory.App, recursive: true }).catch(
        console.log,
      );

      const dark = isDarkTheme(defTheme);

      await writeFile(
        "database/config.astore",
        `{"dark": ${dark}, "theme": "${defTheme}", "font": "def", "autoUpdate": false}`,
        { dir: BaseDirectory.App },
      ).catch(() => {
        sendNotification({
          title: "Error",
          body: "Could not sync preferences!",
        });
      });

      return {
        dark,
        theme: defTheme,
        font: "def",
        autoUpdate: false,
        debug: false,
        accessPrefs: prefs,
        isAdmin: is_admin,
      } as appData;
    });
}

export function setConfig(data: appData) {
  delete data["accessPrefs"];
  delete data["isAdmin"];

  writeFile("database/config.astore", JSON.stringify(data), {
    dir: BaseDirectory.App,
  }).catch(() => {
    sendNotification({ title: "Error", body: "Could not save settings!" });
  });
}
