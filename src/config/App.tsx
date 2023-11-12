import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import fetchPrefs, { appData } from "../app/resources/utilities/preferences";
import logo from "./index.png";
import TLights from "../TLights";

function App(props: { info: string }) {
  const [version, setVersion] = useState("");
  const [perfs, setP] = useState<appData>({
    dark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    autoUpdate: false,
    font: "bhn",
    sidebar: "flex-row",
    debug: false,
    theme: "",
  });

  useEffect(() => {
    fetchPrefs().then((preferences) => {
      setP(preferences);
    });
  }, []);

  getVersion().then((value) => setVersion(value));

  const splashScreens = [
    "Made with tauri and rust!",
    "Open Sourced Software!",
    "The work of AHQ Softwares",
    "ahq-store.web.app",
    `${version !== "" ? `v${version}` : ""}`,
  ];

  return (
    <header className="login-background">
      <TLights />
      <div className={`modal ${perfs?.dark ? "modal-d" : ""}`}>
        <div className="mt-10"></div>
        <h1 style={perfs.dark ? { color: "white" } : undefined}>AHQ Store</h1>
        <div className="mt-[5rem]"></div>
        <img src={logo} alt={"logo"} width={"200px"} />
        <div className="mt-auto"></div>
        <h2>
          <strong>{props.info}</strong>
        </h2>
        <div className="mb-auto"></div>
        <h2 className="text-bold text-center mb-2">
          {props.info === "Running PostInstall Script"
            ? "Will be ready soon"
            : splashScreens[Math.floor(Math.random() * splashScreens.length)]}
        </h2>
      </div>
    </header>
  );
}

export default App;
