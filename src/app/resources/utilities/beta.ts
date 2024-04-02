import { BaseDirectory, mkdir, readTextFile } from "@tauri-apps/plugin-fs";
import { setData } from "./database";

interface betaPrefs {
  enableSearchOnEnter: boolean;
}

export type { betaPrefs };

export default async function initDeveloperConfiguration() {
  await mkdir("", { baseDir: BaseDirectory.AppData }).catch(console.error);
  await mkdir("database", { baseDir: BaseDirectory.AppData }).catch(console.error);

  let prefs: betaPrefs = await readTextFile("database/config.developer", {
    baseDir: BaseDirectory.AppData,
  })
    .then((data) => JSON.parse(data) as betaPrefs)
    .catch(async (e) => {
      console.error(e);
      return {
        enableSearchOnEnter: false,
      };
    });

  Object.entries(prefs).forEach(([key, value]) => {
    setData(key, value);
  });
}
