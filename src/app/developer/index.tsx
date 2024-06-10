//Icons
import { useEffect, useState } from "react";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { FiExternalLink } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { RiApps2Line } from "react-icons/ri";

import { Auth } from "../../auth";

//Components
import Option from "./components/Options";
import fetchApps, { appData } from "../resources/api/fetchApps";
import App from "./components/App";
import Toast from "../resources/api/toast";
import { invoke } from "@tauri-apps/api/core";
import { FaDiscord } from "react-icons/fa6";
import { get_devs_apps } from "../resources/core";

interface DevProps {
  auth: Auth;
  dark: boolean;
}

export default function Developers(props: DevProps) {
  const [publishedApps, setPublishedApps] = useState<appData[] | undefined>(
    undefined,
  );

  const uid = props.auth?.currentUser?.u_id;

  const { dark } = props;

  const [Icon, setIcon] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (uid) {
          const apps = await get_devs_apps(String(uid));

          fetchApps(apps).then((apps) => {
            setPublishedApps(apps as appData[]);
          });
        }
      } catch (e) {
        console.error(e);
        setPublishedApps([]);
      }
    })();
  }, [uid]);

  function darkMode(classes: Array<string>, dark: boolean) {
    let newClasses: string[] = [];

    classes.forEach((c) => {
      newClasses.push(c);
      if (dark) {
        newClasses.push(c + "-dark");
      }
    });

    return newClasses.join(" ");
  }
  return (
    <div className={`${darkMode(["menu"], dark)}`}>
      <Option
        dark={dark}
        ShowCaseIcon={RiApps2Line}
        title={"My Apps"}
        description="View apps published by me"
        PopUp={Icon ? IoIosArrowForward : IoIosArrowDown}
        onClick={() => {
          setIcon((value) => !value);
        }}
        Extra={
          Icon ? (
            <></>
          ) : (
            <div className="flex flex-col">
              {publishedApps === undefined ? (
                <h1 className={`mx-auto ${dark ? "text-white" : ""}`}>
                  Fetching...
                </h1>
              ) : (
                publishedApps.map((value, index) => {
                  return (
                    <App
                      appInfo={value}
                      dark={props.dark}
                      toast={Toast}
                      lastIndex={index === publishedApps.length - 1}
                    />
                  );
                })
              )}
              <span className="mx-auto mt-auto fix-color mb-5 dui-loading dui-loading-spinner dui-loading-lg"></span>
            </div>
          )
        }
      />
      <Option
        dark={dark}
        ShowCaseIcon={AiOutlineAppstoreAdd}
        title={"Add"}
        description="Submit a new app to the store"
        onClick={() => {
          invoke("open", {
            url: "https://ahqstore.github.io/reference/",
          });
          Toast("Launched docs site...", "success", 2);
        }}
        PopUp={FiExternalLink}
      />
      <Option
        dark={dark}
        ShowCaseIcon={FaDiscord}
        title={"Discord"}
        description="Get support via discord!"
        onClick={() => {
          invoke("open", {
            url: "https://discord.gg/a485NGvc4c",
          });
          Toast("Launched discord invite...", "success", 2);
        }}
        PopUp={FiExternalLink}
      />
    </div>
  );
}
