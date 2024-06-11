import { getVersion } from "@tauri-apps/api/app";
import { useState } from "react";

import "./load.css";
import logo from "./index.png";

function Loading({
  unsupported,
  text,
}: {
  unsupported: boolean;
  text: string;
}) {
  const [version, setVersion] = useState("");

  getVersion()
    .then((value) => setVersion(value))
    .catch(() => setVersion("Unknown"));

  const splashScreens = [
    "Made with tauri, rust and react!",
    "Open Sourced Software!",
    "The work of AHQ Softwares",
    "ahqstore.github.io",
  ];

  return (
    <header className="login-background flex flex-col h-screen pt-[40vh]">
      <img src={logo} alt={"logo"} width={"100px"} />
      <h2 className="fix-color">v{version}</h2>

      {unsupported ? (
        <span className="text-xl fix-color mb-[12vh]">Unsupported</span>
      ) : (
        <span className="mt-auto fix-color mb-[2vh] dui-loading dui-loading-spinner dui-loading-lg"></span>
      )}
      {!unsupported && (
        <span className="text-xl fix-color mb-[11vh]">{text}</span>
      )}
      <span className="text-sm fix-color mb-[1vh]">
        {text === "Oops! AHQ Store needs reinstall.."
          ? "We're trying to fix it for you!"
          : splashScreens[Math.floor(Math.random() * splashScreens.length)]}
      </span>
    </header>
  );
}

export { Loading };
