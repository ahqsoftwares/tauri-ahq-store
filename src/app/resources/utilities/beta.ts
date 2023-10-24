import { BaseDirectory, createDir, readTextFile } from "@tauri-apps/api/fs";
import { setData } from "./database";

interface betaPrefs {
  enableSearchOnEnter: boolean;
}

export type { betaPrefs };

export default async function initDeveloperConfiguration() {
  await createDir("", { dir: BaseDirectory.App }).catch(console.error);
  await createDir("database", { dir: BaseDirectory.App }).catch(console.error);

  let prefs: betaPrefs = await readTextFile("database/config.developer", {
    dir: BaseDirectory.App,
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
