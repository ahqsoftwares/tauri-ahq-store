/*
Native API
*/
import {useEffect, useState} from "react";
import {writeFile, createDir, readTextFile, BaseDirectory} from "@tauri-apps/api/fs";
import { sendNotification } from "@tauri-apps/api/notification";
import {fetch} from "@tauri-apps/api/http";

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
         [allAppsData, setData] = useState<any>({
                info: {},
                map: {}
         }),
         App: any = () => (<></>);


        useEffect(() => {
                //Fetch All Apps
                fetch("https://github.com/ahqsoftwares/ahq-store-data/raw/main/database/apps.json", {
                        method: "GET",
                        timeout: 30,
                        responseType: 1
                }).then(({data}) => {
                        //Fetch Maps
                        fetch("https://github.com/ahqsoftwares/ahq-store-data/raw/main/database/mapped.json", {
                                method: "GET",
                                timeout: 30,
                                responseType: 1
                        })
                        .then((response) => {
                                setData({info: data, map: response.data});
                        });
                })
                .catch((e) => {
                        console.log(e);
                });
                setApps([
                        ["Explore Your Needs", ["ufdQHNE1a2OgVQTBCyBR"]]
                ]);
        }, []);
        /*
        Dark Mode
        */
        useEffect(() => {
                document.querySelector("body")?.classList.toggle("dark", dark);
        }, [dark]);

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
                        createDir("database", {dir: BaseDirectory.App}).catch(console.log)
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
                                        <App auth={auth} dark={dark} setDark={setDark} firebase={{db, cache, storage}} apps={apps} setApps={setApps} allAppsData={allAppsData} />
                                </div>
                        </div>
                  </header> : <></>}
                </>
        )
}

export default Render;