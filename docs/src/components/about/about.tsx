import { SiWindows11 } from "react-icons/si";
import { SiTauri } from "react-icons/si";
import { IoCodeSlash } from "react-icons/io5";

import InfoBox from "./aboutbox";
import Links from "./links";

import { useEffect, useState } from "react";

import ReactIcon from "../../react.webp";

import "./index.css";

interface AboutProps {
  dark: boolean;
}

export default function About(props: AboutProps) {
  const { dark } = props;

  const [IconAHQ, setIcon] = useState("");
  const [IconTauri, setIconTauri] = useState("");

  useEffect(() => {
    (async () => {
      const icon = await import("/ahq.png");
      setIcon(icon.default);

      const tauri = await import("./tauri.svg");
      setIconTauri(tauri.default);
    })();
  }, []);

  return (
    <div className={`${dark ? "menu-d" : "menu"}`}>
      <h1
        className={`mt-2 ml-[1.15rem] mr-auto text-3xl ${
          dark ? "text-white" : "text-black"
        } flex`}
      >
        About the Project{" "}
        <span className="text-sm ml-1">
          (Click each of the widgets for more info)
        </span>
      </h1>

      <InfoBox
        Icon={({ size }) => (
          <SiWindows11
            style={{ borderRadius: "10%" }}
            color={"#0094f0"}
            size={size}
          />
        )}
        dark={dark}
        description="Windows 11 and 10"
        title="Designed OS"
        url="https://www.microsoft.com/en-us/software-download"
      />

      <InfoBox
        Icon={ReactIcon}
        dark={dark}
        description="React TypeScript"
        title="Framework (Frontend)"
        url="https://react.dev"
      />

      <InfoBox
        Icon={IconTauri === "" ? SiTauri : IconTauri}
        dark={dark}
        description="Tauri"
        title="Framework (Backend)"
        url="https://tauri.app"
      />

      <InfoBox
        Icon={IconAHQ === "" ? IoCodeSlash : IconAHQ}
        dark={dark}
        description="AHQ Softwares"
        title="Developer"
        rounded={true}
        url="https://github.com/ahqsoftwares"
      />

      <Links dark={dark} />

      <a
        className={`mt-auto mb-3 text-2xl transition-all text-blue-500 hover:text-blue-600 underline ${
          dark ? "text-white hover:text-gray-300" : ""
        }`}
        rel="noreferrer noopener"
        target="_blank"
        href="https://www.flaticon.com/free-icons/track"
        title="track icons"
      >
        Track icons created by Freepik - Flaticon
      </a>
    </div>
  );
}
