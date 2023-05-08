//React
import { useEffect, useState } from "react";
import { Auth, User, updateProfile } from "firebase/auth";

//packages
import Modal from "react-modal";
import Toast from "../resources/api/toast";
import getWindows from "../resources/api/os";
import {
  isAutostartEnabled,
  enableAutostart,
  disableAutoStart,
} from "../resources/api/autostart";

//Tauri
import { sendNotification } from "@tauri-apps/api/notification";

//Components
import CheckBox from "./components/checkbox";
import FontSelector from "./components/font";

import { BiMoon, BiSun } from "react-icons/bi";
import { BsCodeSlash, BsFonts, BsWindowSidebar } from "react-icons/bs";
import { FiDownload } from "react-icons/fi";
import SidebarSelector from "./components/sidebar";

interface InitProps {
  dark: boolean;
  setDark: Function;
  auth: Auth;
  setDev: Function;
  font: string;
  setFont: Function;
  autoUpdate: boolean;
  setAutoUpdate: Function;
  sidebar: string;
  setSidebar: Function;
}

export default function Init(props: InitProps) {
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "35%",
      minWidth: "35%",
      maxHeight: "30%",
      minHeight: "30%",
      transition: "all 500ms linear",
      borderRadius: "20px",
      borderColor: props.dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
      backgroundColor: props.dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
    },
    overlay: {
      backgroundColor: !props.dark
        ? "rgb(55, 65, 81, 0.5)"
        : "rgb(107, 114, 128, 0.75)",
      opacity: "1",
      zIndex: 1000
    },
  };
  Modal.setAppElement("body");
  const [user, setUser] = useState(props.auth.currentUser as User);
  const [show, setShow] = useState(false);
  const [dev, setDev] = useState(
    user?.displayName?.startsWith("(dev)") as boolean
  );
  const [runOn, setRunOn] = useState(false);
  const windowsVersion = getWindows();

  useEffect(() => {
    isAutostartEnabled()
      .then((value) => {
        setRunOn(value);
      })
      .catch((e) => {
        Toast("Sorry! We ran into an error!", "danger", 3000);
      });
  }, []);

  async function Update() {
    const toast = Toast("Please Wait...", "warn", "never");
    try {
      if (props.auth?.currentUser?.emailVerified) {
        setShow(true);
        await updateProfile(user, {
          displayName: !dev
            ? `(dev)${user?.displayName}`
            : user?.displayName?.replace("(dev)", ""),
        });
        toast?.edit(
          `Successfully ${!dev ? "enabled" : "disabled"} developer mode!`,
          "success"
        );
        setUser(props.auth.currentUser as User);
        setDev(!dev);
        props.setDev(!dev);
        setShow(false);
      } else {
        toast?.edit("Please verify your email!", "danger");
      }
    } catch (_e) {
      toast?.edit("Failed to enable developer mode!", "danger");
      sendNotification("Could not update data!");
    }

    setTimeout(() => {
      toast?.unmount();
    }, 5000);
  }

  function darkMode(classes: Array<string>, dark: boolean) {
    return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
  }

  return (
    <>
      <Modal isOpen={show} style={customStyles}>
        <div className="flex flex-col items-center text-center justify-center">
          <div className="my-auto">
            <h1
              className={`block mt-[45%] text-3xl ${
                props.dark ? "text-slate-300" : "text-slate-900"
              }`}
            >
              Please wait...
            </h1>
          </div>
        </div>
      </Modal>

      <div className={darkMode(["menu"], props.dark)}>
        <CheckBox
          dark={props.dark}
          title="Dark Mode"
          description="Enables or disables dark mode"
          Icon={props.dark ? BiSun : BiMoon}
          onClick={() => props.setDark(!props.dark)}
          active={props.dark}
        />

        <FontSelector
          Icon={BsFonts}
          dark={props.dark}
          initial={props.font}
          onChange={(e) => {
            props.setFont(e.target.value);
          }}
        />

        <SidebarSelector
          dark={props.dark}
          Icon={BsWindowSidebar}
          initial={props.sidebar}
          onChange={(e) => {
            props.setSidebar(e.target.value);
          }}
        />

        <CheckBox
          dark={props.dark}
          title="Auto Update Apps"
          description="Automatically update apps when I launch AHQ Store"
          Icon={FiDownload}
          onClick={() => {
            props.setAutoUpdate(!props.autoUpdate);
          }}
          active={props.autoUpdate}
        />

        <CheckBox
          dark={props.dark}
          title="Developer Mode"
          description={
            props.auth?.currentUser?.emailVerified
              ? "Allows you to publish windows apps"
              : "(DISABLED, VERIFY EMAIL) Allows you to publish windows apps"
          }
          Icon={BsCodeSlash}
          onClick={() => Update()}
          disabled={!props.auth?.currentUser?.emailVerified}
          active={dev}
        />

        <CheckBox
          dark={props.dark}
          title="Run on startup"
          description="Run AHQ Store on login (silent run)"
          Icon={windowsVersion}
          onClick={() => {
            const toast = Toast("Please wait...", "warn", "never");

            function unmount() {
              setTimeout(() => {
                toast?.unmount();
              }, 2000);
            }

            (runOn ? disableAutoStart() : enableAutostart())
              .then(() => {
                toast?.edit(
                  `Successfully ${
                    runOn ? "disabled" : "enabled"
                  } run on startup!`,
                  "success"
                );
                setRunOn(!runOn);
                unmount();
              })
              .catch(() => {
                toast?.edit(
                  `Could not ${runOn ? "disable" : "enable"} run on startup`,
                  "danger"
                );
                unmount();
              });
          }}
          active={runOn}
        />

        <></>
      </div>
    </>
  );
}
