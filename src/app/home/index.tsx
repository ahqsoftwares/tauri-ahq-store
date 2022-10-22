import {useState} from "react";
import {writeFile, createDir} from "@tauri-apps/api/fs";
import { invoke } from '@tauri-apps/api/tauri';

function darkMode(classes: Array<string>, dark: boolean) {
    return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
}

interface HomeProps {
    dark: boolean
}

export default function Home(props: HomeProps) {
    let apps = "C:\\ProgramData\\AHQ Store Applications\\Updaters";

    let [status, setState] = useState("Install Simple Host Desktop (SAMPLE APP);"),
    [install, set] = useState(true);

    createDir(apps, {recursive: true})
    .then(() => {
        writeFile(`${apps}\\Simple Host.updater`, "{version: \"1.0.0\"}");
    });

    (async() => {
        const status = await invoke("check_app", {appName: "Simple Host"});
        if (status) {
            setState("Uninstall!");
            set(false);
        }
    })()

    function Download() {
        setState("Downloading...;-disabled");
        invoke("clean", {path: `C:\\ProgramData\\AHQ Store Applications\\Installers\\SimpleHost.zip`});
                invoke("download", { url: "https://github.com/ahqsoftwares/Simple-Host-App/releases/download/v2.1.0/Simple-Host-Desktop-2.1.0-win.zip", name: "SimpleHost.zip"})
.then(() => {
    setState("Installing...;-disabled");
  invoke("extract", {app: "Simple Host", installer: "SimpleHost.zip"})
  .then(() => {
    invoke("clean", {path: `C:\\ProgramData\\AHQ Store Applications\\Installers\\SimpleHost.zip`});
    invoke("shortcut", { app: "Simple Host\\Simple Host Desktop.exe", appName: "Simple Host Desktop" })
        setState("Success;");
        setTimeout(() => {
            setState("Uninstall")
        }, 2000);
  });
})
.catch((e) => {
  console.log(e);
});
    }

         return (<div className={`${darkMode(["menu"], props.dark)} flex flex-col items-center justify-center`}><button
            className={`button`}
            disabled={status.split(";")[1] === "-disabled"}
            onClick={async() => {
                if (install) {
                    Download()
                } else {
                    invoke("uninstall", {appName: "Simple Host", appFullName: "Simple Host Desktop"})
                    .then(() => {
                        console.log("Uninstalled!");
                        setState("Install Simple Host Desktop (SAMPLE APP);");
                        set(true);
                    })
                    .catch(() => {
                        console.log("Failed!");
                    });
                }
            }}>
            {status.split(";")[0]}
         </button></div>);
}