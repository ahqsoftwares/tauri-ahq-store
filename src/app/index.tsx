import {useEffect, useState} from "react";
import Nav from "./Nav";
import {writeFile, createDir, readTextFile, BaseDirectory} from "@tauri-apps/api/fs";
import { sendNotification } from "@tauri-apps/api/notification";
import "./index.css";
import User from "./client/index";
import Settings from "./settings/index";

function Render(props: any) {
         const {auth} = props.data;
         let [page, changePage] = useState("home"),
         [dark, setD] = useState(true),
         [load, setLoad] = useState(false),
         App: any = () => (<></>);

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
                                    setDark(mode);
                                    await writeFile("database/config.astore", `{"dark": ${mode}}`, {dir: BaseDirectory.App});
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

         return (
                  <>
                   {load === true ? <header className={`apps${dark ? "-d": ""} flex transition-all`}>
                           <Nav active={page} home={(page: string) => changePage(page)} dark={[dark, setDark]}/>
                           <div className="w-screen h-screen">
                                    <div className="flex flex-col w-[100%] h-[100%] justify-center">
                                             <App auth={auth} dark={dark} setDark={setDark} />
                                    </div>
                           </div>
                  </header> : <></>}
                  </>
         )
}

export default Render;