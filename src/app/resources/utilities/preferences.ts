import {
  BaseDirectory,
  mkdir,
  readTextFile,
  writeFile,
} from "@tauri-apps/plugin-fs";

import { sendNotification } from "@tauri-apps/plugin-notification";

import { Prefs, get_access_perfs } from "../core";
import { invoke } from "@tauri-apps/api/core";
import { exit } from "@tauri-apps/plugin-process";
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
  mkdir("", { baseDir: BaseDirectory.AppData }).catch((e) => e);
  mkdir("database", { baseDir: BaseDirectory.AppData }).catch((e) => e);

  const is_admin = await invoke<boolean>("is_an_admin").catch((e) => {
    console.log(e);

    return true;
  });
  const prefs = await get_access_perfs();

  if (!is_admin && !prefs.launch_app) {
    sendNotification({
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
    baseDir: BaseDirectory.AppData,
  })
    .then((data) => JSON.parse(data) as appData | undefined)
    .then(
      (data) =>
        ({
          theme: defTheme,
          font: "def",
          autoUpdate: false,
          debug: false,
          sidebar: "flex-row",

          ...data,

          dark: isDarkTheme(data?.theme || defTheme),
          accessPrefs: prefs,
          isAdmin: is_admin,
        }) as appData,
    )
    .catch(async (e) => {
      console.error(e);
      await mkdir("database", {
        baseDir: BaseDirectory.AppData,
        recursive: true,
      }).catch(console.error);

      const dark = isDarkTheme(defTheme);

      await writeFile(
        "database/config.astore",
        new TextEncoder().encode(
          `{"dark": ${dark}, "theme": "${defTheme}", "font": "def", "autoUpdate": false, "sidebar": "flex-row"}`,
        ),
        { baseDir: BaseDirectory.AppData, append: false },
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
        sidebar: "flex-row",
      } as appData;
    });
}

export function setConfig(data: appData) {
  delete data["accessPrefs"];
  delete data["isAdmin"];

  writeFile(
    "database/config.astore",
    new TextEncoder().encode(JSON.stringify(data)),
    {
      baseDir: BaseDirectory.AppData,
      append: false,
    },
  ).catch(() => {
    sendNotification({ title: "Error", body: "Could not save settings!" });
  });
}
