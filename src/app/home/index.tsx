import {useState} from "react";
import { invoke } from '@tauri-apps/api/tauri';
import {appDir} from "@tauri-apps/api/path";

export default function Home() {
    let [status, setState] = useState("Install Simple Host Desktop (SAMPLE APP);");
         return (<button
            className={`button`}
            disabled={status.split(";")[1] === "-disabled"}
            onClick={async() => {
                let BaseDirectory = {
                    App: await appDir()
                };
                setState("Downloading...;-disabled");
                invoke("download", { url: "https://github.com/ahqsoftwares/Simple-Host-App/releases/download/v2.1.0/Simple-Host-Desktop-Setup-2.1.0.exe", path: `${BaseDirectory.App}/install/` })
.then(() => {
    setState("Installing...;-disabled");
    console.log(`${BaseDirectory.App}/install/Simple-Host-Desktop-Setup-2.1.0.exe`);
  invoke("install", {path: `${BaseDirectory.App}/install/Simple-Host-Desktop-Setup-2.1.0.exe`})
  .then((code) => {
    if (code) {
        setState("Success;");
    } else {
        setState("Failed;");
    }
    console.log(code);
  });
})
.catch((e) => {
  console.log(e);
});
            }}>
            {status.split(";")[0]}
         </button>);
}