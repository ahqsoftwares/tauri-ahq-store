import {
  BaseDirectory,
  createDir,
  readTextFile,
  writeFile,
} from "@tauri-apps/api/fs";
import { sendNotification } from "@tauri-apps/api/notification";

interface appData {
  dark: boolean;
  font: string;
  autoUpdate: boolean;
}

export type { appData };

export default async function fetchPrefs() {
  createDir("", { dir: BaseDirectory.App }).catch((e) => e);

  return await readTextFile("database/config.astore", {
    dir: BaseDirectory.App,
  })
    .then((data) => JSON.parse(data) as appData)
    .catch(async (e) => {
      console.log(e);
      await createDir("database", { dir: BaseDirectory.App }).catch(
        console.log
      );
      let mode =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

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
      } as appData;
    });
}

export function setConfig(data: appData) {
  writeFile("database/config.astore", JSON.stringify(data), {
    dir: BaseDirectory.App,
  }).catch(() => {
    sendNotification({ title: "Error", body: "Could not save settings!" });
  });
}
