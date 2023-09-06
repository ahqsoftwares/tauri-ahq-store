import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { IoMdArrowRoundBack } from "react-icons/io";
import {
  get_access_perfs,
  set_access_prefs,
} from "../../resources/core";

/**
 * Types
 */
import type { IPrefs } from "../../resources/types/app";
import type { IProps } from "../../resources/types/settings";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default function StartOptions({ setOUO, dark }: IProps) {
  const [settings, setSettings] = useState<IPrefs>({
    launch_app: true,
    install_apps: true,
  });
  const [loading, setLoading] = useState(false);

  async function updatePrefs(settings: IPrefs) {
    console.log(settings);

    await delay(250);

    setLoading(true);

    await set_access_prefs(settings);

    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    (async () => {
      const prefs = await get_access_perfs();
      setSettings(prefs);

      setLoading(false);
    })();
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex">
        <button
          className="dui-btn dui-btn-square"
          onClick={() => setTimeout(() => setOUO(false), 250)}
          disabled={loading}
        >
          <IoMdArrowRoundBack
            width="2em"
            height="2em"
            color={dark ? "white" : "black"}
            style={{
              minWidth: "2em",
              minHeight: "2em",
            }}
          />
        </button>
        <h1 className="my-auto ml-2 text-2xl">Edit Access Policy</h1>
      </div>
      <div className="mt-[1.5rem] flex justify-center items-center">
        <h1 className="text-xl">Deny non-admins from launching AHQ Store</h1>

        <input
          type={"checkbox"}
          className="dui-toggle dui-toggle-error dui-toggle-lg ml-auto"
          disabled={loading}
          checked={!settings.launch_app}
          onChange={(e) => {
            const checked = e?.currentTarget?.checked;

            if (checked != null) {
              setSettings((s) => {
                const data = {
                  ...s,
                  launch_app: !checked,
                };

                updatePrefs(data);

                return data;
              });
            }
          }}
        />
      </div>
      <div className="mt-2 flex justify-center items-center">
        <h1 className="text-xl">Deny non-admins from installing apps</h1>

        <input
          type={"checkbox"}
          className="dui-toggle dui-toggle-error dui-toggle-lg ml-auto"
          disabled={settings.launch_app == false || loading}
          checked={!settings.install_apps}
          onChange={(e) => {
            const checked = e?.currentTarget?.checked;

            if (checked != null) {
              setSettings((s) => {
                const data = {
                  ...s,
                  install_apps: !checked,
                };

                updatePrefs(data);

                return data;
              });
            }
          }}
        />
      </div>
    </div>
  );
}
