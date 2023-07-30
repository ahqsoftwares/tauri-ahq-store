import {
  BaseDirectory,
  createDir,
  readTextFile,
  writeFile,
} from "@tauri-apps/api/fs";

import { sendNotification } from "@tauri-apps/api/notification";

import { Prefs, get_access_perfs } from "../core";

interface appData {
  dark: boolean;
  font: string;
  autoUpdate: boolean;
  sidebar: string;
  debug: boolean;
  accessPrefs?: Prefs;
}

export type { appData };

export default async function fetchPrefs(): Promise<appData> {
  createDir("", { dir: BaseDirectory.App }).catch((e) => e);
  createDir("database", { dir: BaseDirectory.App }).catch((e) => e);

  const prefs = await get_access_perfs();

  const mode =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

  return await readTextFile("database/config.astore", {
    dir: BaseDirectory.App,
  })
    .then((data) => JSON.parse(data) as appData | undefined)
    .then((data) => ({
      dark: mode,
      font: "def",
      autoUpdate: false,
      debug: false,
      ...data,
      accessPrefs: prefs
    } as appData))
    .catch(async (e) => {
      console.log(e);
      await createDir("database", { dir: BaseDirectory.App }).catch(
        console.log
      );

      await writeFile(
        "database/config.astore",
        `{"dark": ${mode}, "font": "def", "autoUpdate": false}`,
        { dir: BaseDirectory.App }
      ).catch(() => {
        sendNotification({
          title: "Error",
          body: "Could not sync preferences!",
        });
      });

      return {
        dark: mode,
        font: "def",
        autoUpdate: false,
        debug: false,
        accessPrefs: prefs
      } as appData;
    });
}

export function setConfig(data: appData) {
  delete data["accessPrefs"];

  writeFile("database/config.astore", JSON.stringify(data), {
    dir: BaseDirectory.App,
  }).catch(() => {
    sendNotification({ title: "Error", body: "Could not save settings!" });
  });
}
