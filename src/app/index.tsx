/*
Native API
*/
import {useEffect, useState} from "react";
import {writeFile, createDir, readTextFile, BaseDirectory} from "@tauri-apps/api/fs";
import { sendNotification } from "@tauri-apps/api/notification";
import {fetch} from "@tauri-apps/api/http";
import {appWindow} from "@tauri-apps/api/window";

import { runAutoUpdate } from "./resources/api/updater";
/*
Firebase
*/
import { Auth } from "firebase/auth";

/*
CSS
*/
import "./index.css";

/*
Components
*/
import Home from "./home/index";
import Nav from "./Nav";
import Developer from "./developer/";
import Apps from "./apps/";
import User from "./client/index";
import Library from "./library";
import Settings from "./settings/index";

import BaseAPI from "./server";

interface AppProps {
        data: {
                auth: Auth
        }
}

function Render(props: AppProps) {
        const {auth} = props.data;
        let [page, changePage] = useState("home"),
        [dev, setDev] = useState(auth.currentUser?.displayName?.startsWith("(dev)")),
        [dark, setD] = useState(true),
        [font, setFont] = useState("def"),
        [load, setLoad] = useState(false),
        [autoUpdate, setUpdate] = useState(false),
        [apps, setApps] = useState<any>([]),
        [allAppsData, setData] = useState<{map: {[key: string]: Object}}>({
               map: {}
        }),
        App: any = () => (<></>);

        useEffect(() => {
                appWindow.listen("sendUpdaterStatus", ({payload}: any) => {
                        console.log(payload);
                });
                appWindow.listen("protocol", (
                        {
                                payload
                        }: {
                                payload: string
                        }
                ) => {
                        if (payload.startsWith("ahqstore://")) {
                                const [page] = payload.replace("ahqstore://", "").split("/");

                                switch (page) {
                                        case "app":
                                                changePage("apps");
                                                break;
                                        case "update": 
                                                changePage("apps");
                                                break;
                                        default:
                                                break;
                                }
                        };
                });
        }, []);


        useEffect(() => {
                //Fetch All Maps (not full data, full data will be lazy fetched)
                (async() => {
                        //Fetch Maps
                        const {data: Mapped} = await fetch("https://github.com/ahqsoftwares/ahq-store-data/raw/main/database/mapped.json", {
                                method: "GET",
                                timeout: 30,
                                responseType: 1
                        });

                        setData({
                                map: Mapped as {
                                        [key: string]: Object;
                                }
                        });

                        const {data: Home} = await fetch("https://github.com/ahqsoftwares/ahq-store-data/raw/main/database/home.json", {
                                method: "GET",
                                timeout: 30,
                                responseType: 1
                        });

                        setApps(Home);
                })()
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
                        setFont(typeof(json.font) === "string" ? json.font : "def");
                        setUpdate(typeof(json.autoUpdate) === "boolean" ? json.autoUpdate : false);

                        runAutoUpdate(typeof(json.autoUpdate) === "boolean" ? json.autoUpdate : false);

                        setLoad(true);
                })
                .catch((e) => {
                        console.log(e);
                        createDir("database", {dir: BaseDirectory.App}).catch(console.log)
                        .then(async() => {
                                let mode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
                                setD(mode);
                                await writeFile("database/config.astore", `{"dark": ${mode}, "font": "def", "autoUpdate": false}`, {dir: BaseDirectory.App})
                                .catch(() => {
                                        sendNotification({title: "Error", body: "Could not sync notifications!"});
                                });
                        })
                        .then(() => {
                                setLoad(true);
                        });
                });
        }, []);

        useEffect(() => {
                const element = document.querySelector("body");
                element?.classList.toggle("def", font === "def");
                element?.classList.toggle("tnr", font === "tnr");
                element?.classList.toggle("geo", font === "geo");
                element?.classList.toggle("gra", font === "gra");
                element?.classList.toggle("ari", font === "ari");
                element?.classList.toggle("ext", font === "ext");
                element?.classList.toggle("bhn", font === "bhn");
        }, [font]);

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
                updateConfig({dark, font, autoUpdate});
        }
        function changeFont(newFont: string) {
                setFont(newFont);
                updateConfig({dark, font: newFont, autoUpdate});
        }
        function setAutoUpdate(newStatus: boolean) {
                setUpdate(newStatus);
                updateConfig({dark, font, autoUpdate: newStatus});
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
                case "developer":
                        App = Developer;
                        break;
                case "library":
                        App = Library;
                        break;
        }

        /*
        App renderer
        */

        return (
                <>
                   {load === true ? <header className={`apps${dark ? "-d": ""} flex transition-all`}>
                         <Nav active={page} home={(page: string) => changePage(page)} dev={dev} dark={[dark, setDark]}/>
                        <div className="w-screen h-screen">
                                <div className="flex flex-col w-[100%] h-[100%] justify-center">
                                        <App 
                                                baseApi={BaseAPI} 

                                                auth={auth} 

                                                setDev={setDev} 

                                                dark={dark} 
                                                setDark={setDark} 

                                                font={font}
                                                setFont={changeFont}

                                                apps={apps} 

                                                setApps={setApps} 
                                                allAppsData={allAppsData} 

                                                autoUpdate={autoUpdate}
                                                setAutoUpdate={setAutoUpdate}
                                        />
                                </div>
                        </div>
                  </header> : <></>}
                </>
        )
}

export default Render;