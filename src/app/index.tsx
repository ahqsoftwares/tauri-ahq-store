/*
Native API
*/
import {useEffect, useState} from "react";
import {writeFile, createDir, readTextFile, BaseDirectory} from "@tauri-apps/api/fs";
import { sendNotification } from "@tauri-apps/api/notification";

/*
Firebase
*/
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import { Database } from "firebase/database";
import { FirebaseStorage } from "firebase/storage";

/*
CSS
*/
import "./index.css";

import Home from "./home/index";
import Nav from "./Nav";
import Apps from "./apps/";
import User from "./client/index";
import Settings from "./settings/index";
import Icon from "./apps/icon.png";

interface AppProps {
        data: {
                auth: Auth,
                db: Firestore,
                cache: Database,
                storage: FirebaseStorage
        }
}

function Render(props: AppProps) {
         const {auth, db, cache, storage} = props.data;
         let [page, changePage] = useState("home"),
         [dark, setD] = useState(true),
         [load, setLoad] = useState(false),
         [apps, setApps] = useState<any>([]),
         App: any = () => (<></>);


        useEffect(() => {
                setApps([
                        ["Explore Your Needs", [{
                                title: "AHQ Store",
                                description: "The store which can make you feel better\nWritten in rust and in ahq.js",
                                img: Icon as string,
                                appId: "ahq",
                                installData: {
                                        downloadUrl: "https://github.com/ahqsoftwares/Simple-Host-App/releases/download/v2.1.0/Simple-Host-Desktop-2.1.0-win.zip",
                                        installer: "Simple-Host-Desktop-2.1.0-win.zip",
                                        location: "Simple Host"
                                }
                        }]]
                ]);
        }, []);
        /*
        Dark Mode
        */

         useEffect(() => {
                  createDir("", {dir: BaseDirectory.App})
                  .catch(e => e);


                  readTextFile("database/config.astore", {dir: BaseDirectory.App})
                  .then((data) => {
                           const json = JSON.parse(data || "{}");
                           setD(typeof(json.dark) === "undefined" ? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) : json.dark);
                           setLoad(true);
                  })
                  .catch((e) => {
                        console.log(e);
                        createDir("database", {dir: BaseDirectory.App}).then(console.log).catch(console.log)
                        .then(async() => {
                                let mode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
                                setD(mode);
                                await writeFile("database/config.astore", `{"dark": ${mode}}`, {dir: BaseDirectory.App})
                                .catch(() => {
                                        sendNotification({title: "Error", body: "Could not sync notifications!"});
                                });
                        })
                        .then(() => {
                                setLoad(true);
                        });
                });
         }, []);

        function updateConfig(data: Object) {
                if (load) {
                        writeFile("database/config.astore", JSON.stringify(data), {dir: BaseDirectory.App})
                        .catch(() => {
                                sendNotification({title: "Error", body: "Could not save settings!"});
                        });
                }
        }
        function setDark(dark: boolean) {
                setD(dark);
                updateConfig({dark});
        }

        /*
        Page Selector
        */

         switch (page) {
                case "apps":
                        App = Apps;
                        break;
                case "settings":
                        App = Settings;
                        break;
                case "user":
                        App = User;
                        break;
                case "home":
                        App = Home;
                        break;
        }

        /*
        App renderer
        */

        return (
                <>
                   {load === true ? <header className={`apps${dark ? "-d": ""} flex transition-all`}>
                         <Nav active={page} home={(page: string) => changePage(page)} dark={[dark, setDark]}/>
                        <div className="w-screen h-screen">
                                <div className="flex flex-col w-[100%] h-[100%] justify-center">
                                        <App auth={auth} dark={dark} setDark={setDark} firebase={{db, cache, storage}} apps={apps} setApps={setApps}/>
                                </div>
                        </div>
                  </header> : <></>}
                </>
        )
}

export default Render;