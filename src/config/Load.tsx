import { getVersion } from "@tauri-apps/api/app";
import { useState } from "react";

import "./load.css";
import logo from "./index.png";

function Loading({ unsupported }: { unsupported: boolean }) {
  const [version, setVersion] = useState("");

  getVersion().then((value) => setVersion(value));

  return (
    <header className="login-background flex flex-col h-screen pt-[30vh]">
      <img src={logo} alt={"logo"} width={"200px"} />
      <h2 className="fix-color">v{version}</h2>

      {unsupported ?
        <span className="text-xl fix-color mb-[12vh]">Unsupported</span>
        :
        <span className="mt-auto fix-color mb-[12vh] dui-loading dui-loading-spinner dui-loading-lg"></span>
      }
    </header>
  );
}

export { Loading };
