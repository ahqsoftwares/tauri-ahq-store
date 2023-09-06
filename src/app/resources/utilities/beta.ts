import { BaseDirectory, createDir, readTextFile } from "@tauri-apps/api/fs";
import { setData } from "./database";

/**
 * Types
 */
import type { IBetaPrefs } from "../types/utilities";

export default async function initDeveloperConfiguration() {
  await createDir("", { dir: BaseDirectory.App }).catch(console.log);
  await createDir("database", { dir: BaseDirectory.App }).catch(console.log);

  let prefs: IBetaPrefs = await readTextFile("database/config.developer", {
    dir: BaseDirectory.App,
  })
    .then((data) => JSON.parse(data) as IBetaPrefs)
    .catch(async (e) => {
      console.log(e);
      return {
        enableSearchOnEnter: false,
      };
    });

  Object.entries(prefs).forEach(([key, value]) => {
    setData(key, value);
  });
}
