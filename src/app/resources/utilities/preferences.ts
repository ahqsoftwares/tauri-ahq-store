import {
  BaseDirectory,
  createDir,
  readTextFile,
  writeFile,
} from "@tauri-apps/api/fs";

import { sendNotification } from "@tauri-apps/api/notification";

import { get_access_perfs } from "../core";
import { invoke } from "@tauri-apps/api/tauri";
import { notification } from "@tauri-apps/api";
import { exit } from "@tauri-apps/api/process";
import { isDarkTheme } from "./themes";

/**
 * Types
 */
import type { IAppData } from "../types/resources/utilities";

export default async function fetchPrefs(): Promise<IAppData> {
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
    .then((data) => JSON.parse(data) as IAppData | undefined)
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
        }) as IAppData,
    )
    .catch(async (e) => {
      console.log(e);
      await createDir("database", {
        dir: BaseDirectory.App,
        recursive: true,
      }).catch(console.log);

      const dark = isDarkTheme(defTheme);

      await writeFile(
        "database/config.astore",
        `{"dark": ${dark}, "theme": "${defTheme}", "font": "def", "autoUpdate": false, "sidebar": "flex-row"}`,
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
        sidebar: "flex-row",
      } as IAppData;
    });
}

export function setConfig(data: IAppData) {
  delete data["accessPrefs"];
  delete data["isAdmin"];

  writeFile("database/config.astore", JSON.stringify(data), {
    dir: BaseDirectory.App,
  }).catch(() => {
    sendNotification({ title: "Error", body: "Could not save settings!" });
  });
}
