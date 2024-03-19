//React
import { useEffect, useState } from "react";
import { Auth, User, updateProfile } from "../../auth";

//packages
import Toast from "../resources/api/toast";
import getWindows, {
  getWindowsName,
  versionToBuild,
} from "../resources/api/os";

//Tauri
import { sendNotification } from "@tauri-apps/api/notification";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/tauri";

//Components
import CheckBox from "./components/checkbox";
import ListSelector from "./components/font";
import SidebarSelector from "./components/sidebar";
import PopUp from "../resources/components/popup";
import CustomPopUp from "./components/popup";
import StartOptions from "./components/startOptions";
import themes from "../resources/utilities/themes";

import { BiMoon, BiSun } from "react-icons/bi";
import { BsCodeSlash, BsFonts, BsWindowSidebar } from "react-icons/bs";
import { HiWrenchScrewdriver } from "react-icons/hi2";
import { FaUsersGear } from "react-icons/fa6";
import { HiOutlineColorSwatch } from "react-icons/hi";

import "./styles.css";

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
  admin: boolean;
  theme: string;
  setTheme: Function;
}

export default function Init(props: InitProps) {
  const [user, setUser] = useState(props.auth.currentUser as User),
    [show, setShow] = useState(false),
    [showOtherUserOptions, setOUO] = useState(false),
    [dev, setDev] = useState(user?.dev);

  const [ver, setVer] = useState("0.9.0");
  const [os, setOs] = useState("");
  const [linuxVer, setLinuxVer] = useState("Unknown Distro");

  useEffect(() => {
    getVersion()
      .then(setVer)
      .catch(() => {});

    const ver = getWindowsName();
    setOs(ver);
    if (ver == "linux") {
      invoke<string>("get_linux_distro").then((ver) =>
        setLinuxVer(ver.replace(/"/g, "")),
      );
    }
  }, []);

  async function Update() {
    const toast = Toast("Please Wait...", "warn", "never");
    try {
      if (props.auth?.currentUser?.e_verified) {
        setShow(true);
        await updateProfile(props.auth, {
          dev: !dev,
        });
        toast?.edit(
          `Successfully ${!dev ? "enabled" : "disabled"} developer mode!`,
          "success",
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
    let newClasses: string[] = [];

    classes.forEach((c) => {
      newClasses.push(c);
      if (dark) {
        newClasses.push(c + "-dark");
      }
    });

    return newClasses.join(" ");
  }

  function openUrl(url: string) {
    let toast = Toast("Please Wait...", "warn", "never");

    function unMount() {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        toast?.unmount();
      }, 1500);
    }

    invoke("open", {
      url,
    })
      .then(() => {
        toast?.edit("Opened in default browser", "success");
        unMount();
      })
      .catch(() => {
        toast?.edit(`Could not open ${url}`, "danger");
        unMount();
      });
  }

  return (
    <>
      <PopUp shown={show} height="30%" width="75%">
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
      </PopUp>
      <PopUp shown={showOtherUserOptions} width="50%" height="25%">
        <StartOptions setOUO={setOUO} dark={props.dark} />
      </PopUp>

      <div className={darkMode(["menu"], props.dark)}>
        <h1
          className={`mt-3 text-3xl ${
            props.dark ? "text-white" : "text-slate-700"
          } mr-auto ml-3`}
        >
          General
        </h1>

        <CheckBox
          url={false}
          dark={props.dark}
          title="Dark Mode"
          description="Enables or disables dark mode"
          Icon={props.dark ? BiSun : BiMoon}
          onClick={() => props.setDark(!props.dark)}
          active={props.dark}
        />

        <ListSelector
          list={themes}
          Icon={HiOutlineColorSwatch}
          initial={props.theme}
          onChange={(e) => {
            props.setTheme(e.target.value);
          }}
        />

        <ListSelector
          Icon={BsFonts}
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

        <h1
          className={`mt-3 text-3xl ${
            props.dark ? "text-white" : "text-slate-700"
          } mr-auto ml-3`}
        >
          Advanced
        </h1>

        {versionToBuild(ver).includes("-next") ? (
          <CheckBox
            dark={props.dark}
            url={false}
            title="Alpha Build"
            description="You are currently in a alpha build; Click to reload app"
            Icon={HiWrenchScrewdriver}
            onClick={() => {
              window.location.reload();
            }}
            active={false}
            noCheckbox={true}
          />
        ) : (
          <></>
        )}

        <CheckBox
          dark={props.dark}
          url={false}
          title="Developer Mode"
          description={
            props.auth?.currentUser?.e_verified
              ? "Allows you to publish windows apps"
              : "(DISABLED, VERIFY EMAIL) Allows you to publish windows apps"
          }
          Icon={BsCodeSlash}
          onClick={() => Update()}
          disabled={!props.auth?.currentUser?.e_verified}
          active={dev}
        />

        {props.admin && os != "linux" ? (
          <CustomPopUp
            dark={props.dark}
            Icon={FaUsersGear}
            title="Access Policy"
            description="Edit the access policy for non-administrators"
            onClick={() => setOUO((d) => !d)}
          />
        ) : (
          <></>
        )}

        <h1
          className={`mt-3 text-3xl ${
            props.dark ? "text-white" : "text-slate-700"
          } mr-auto ml-3`}
        >
          About
        </h1>

        <div className="flex mx-auto w-[98%] h-auto items-center justify-center">
          <CheckBox
            dark={props.dark}
            url={false}
            title={os != "linux" ? `Operation System` : "Linux Distro"}
            description={os != "linux" ? `Windows ${os}` : linuxVer}
            Icon={getWindows()}
            onClick={() => {}}
            disabled={true}
            active={true}
            noCheckbox={true}
          />

          <div className="w-[1.2rem]"></div>

          <CheckBox
            dark={props.dark}
            title="Build"
            url={true}
            description={`AHQ Store v${ver} (Build ${versionToBuild(ver)})`}
            Icon={"/logo192.png"}
            onClick={() => {
              openUrl("https://ahqstore.github.io");
            }}
            disabled={true}
            active={true}
            noCheckbox={true}
          />
        </div>
        <div className="flex mx-auto w-[98%] h-auto items-center justify-center">
          <CheckBox
            dark={props.dark}
            url={true}
            title="Frontend Framework"
            description={`React (TypeScript)`}
            Icon={"/react.webp"}
            onClick={() => {
              openUrl("https://react.dev");
            }}
            disabled={true}
            active={true}
            noCheckbox={true}
          />

          <div className="w-[1.2rem]"></div>

          <CheckBox
            dark={props.dark}
            url={true}
            title="Backend Framework"
            description={`Tauri (Rust)`}
            Icon={"/tauri.svg"}
            onClick={() => {
              openUrl("https://tauri.app");
            }}
            disabled={true}
            active={true}
            noCheckbox={true}
          />
        </div>
        <div className="flex mx-auto w-[98%] h-auto items-center justify-center mb-5">
          <CheckBox
            dark={props.dark}
            url={true}
            title="Developer"
            description={`AHQ (github.com/ahqsoftwares)`}
            Icon={"/ahq.png"}
            onClick={() => {
              openUrl("https://github.com/ahqsoftwares");
            }}
            disabled={true}
            active={true}
            noCheckbox={true}
            roundedImage={true}
          />

          <div className="w-[1.2rem]"></div>

          <CheckBox
            dark={props.dark}
            url={true}
            title="Github Repo"
            description={`Click to open in default browser`}
            Icon={props.dark ? "/github-dark.png" : "/github.png"}
            onClick={() => {
              openUrl("https://github.com/ahqsoftwares/tauri-ahq-store");
            }}
            disabled={true}
            active={true}
            noCheckbox={true}
          />
        </div>
      </div>
    </>
  );
}
