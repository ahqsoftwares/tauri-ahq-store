import { getVersion } from "@tauri-apps/api/app";
import { useState } from "react";
import logo from "./index.png";

function App(props: { info: string }) {
  const [version, setVersion] = useState("");

  getVersion().then((value) => setVersion(value));

  const splashScreens = [
    "Made possible with open source!",
    "The work of AHQ Softwares",
    "ahqstore.cf",
    `${version !== "" ? `v${version}` : ""}`,
  ];

  return (
    <header className="login-background">
      <div className="modal">
        <div className="mt-10"></div>
        <h1>AHQ Store</h1>
        <div className="mt-[5rem]"></div>
        <img src={logo} alt={"logo"} width={"200px"} />
        <div className="mt-auto"></div>
        <h2>
          <strong>{props.info}</strong>
        </h2>
        <div className="mb-auto"></div>
        <h2 className="text-bold text-center mb-2">
          {splashScreens[Math.floor(Math.random() * splashScreens.length)]}
        </h2>
      </div>
    </header>
  );
}

export default App;
