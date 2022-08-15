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

import Nav from "./Nav";
import User from "./client/index";
import Settings from "./settings/index";

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
         App: any = () => (<></>);

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
                        break;
                case "settings":
                        App = Settings;
                        break;
                case "user":
                        App = User;
                        break;
                default:
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
                                        <App auth={auth} dark={dark} setDark={setDark} firebase={{db, cache, storage}}/>
                                </div>
                        </div>
                  </header> : <></>}
                </>
        )
}

export default Render;