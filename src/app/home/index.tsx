import {useState} from "react";
import { invoke } from '@tauri-apps/api/tauri';

export default function Home() {
    let [status, setState] = useState("Install Simple Host Desktop (SAMPLE APP);");
         return (<button
            className={`button`}
            disabled={status.split(";")[1] === "-disabled"}
            onClick={async() => {
                setState("Downloading...;-disabled");
                invoke("download", { url: "https://github.com/ahqsoftwares/Simple-Host-App/releases/download/v2.1.0/Simple-Host-Desktop-2.1.0-win.zip"})
.then(() => {
    setState("Installing...;-disabled");
  invoke("extract", {app: "Simple Host", installer: "Simple-Host-Desktop-2.1.0-win.zip"})
  .then(() => {
    invoke("clean", {path: `C:\\ProgramData\\AHQ Store Applications\\Installers\\Simple-Host-Desktop-2.1.0-win.zip`});
    setState("Success;");
  });
})
.catch((e) => {
  console.log(e);
});
            }}>
            {status.split(";")[0]}
         </button>);
}