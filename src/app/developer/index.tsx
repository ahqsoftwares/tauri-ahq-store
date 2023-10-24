//Icons
import { useEffect, useState } from "react";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { FiExternalLink } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { RiApps2Line } from "react-icons/ri";

import { Auth } from "firebase/auth";

//Components
import Option from "./components/Options";
import fetchApps, { appData, fetchAuthor } from "../resources/api/fetchApps";
import App from "./components/App";
import Toast from "../resources/api/toast";
import { invoke } from "@tauri-apps/api/tauri";

interface DevProps {
  auth: Auth;
  dark: boolean;
}

export default function Developers(props: DevProps) {
  const [publishedApps, setPublishedApps] = useState<appData[] | undefined>(
    undefined,
  );

  const uid = props.auth?.currentUser?.uid;

  const { dark } = props;

  const [Icon, setIcon] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { apps } = (await fetchAuthor(uid as string, false)).apps as {
          apps: string[];
        };

        fetchApps(apps).then((apps) => {
          setPublishedApps(apps as appData[]);
        });
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
                publishedApps.map((value, index) => (
                  <App
                    appInfo={value}
                    dark={props.dark}
                    toast={Toast}
                    lastIndex={index === publishedApps.length - 1}
                  />
                ))
              )}
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
            url: "https://discord.gg/a485NGvc4c",
          });
          Toast("Launched discord invite...", "success", 2);
        }}
        PopUp={FiExternalLink}
      />
    </div>
  );
}
