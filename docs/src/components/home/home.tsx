import getAppInstallerFile from "../../components/api/model/fetchDownload";
import {
         get,
         set
} from "../../components/api/database";

import logo from "../logo.png";

import { useEffect, useState } from "react";

interface HomeProps {
         dark: boolean
}

export default function Home(props: HomeProps) {
         const {
                  dark
         } = props;

         const [download, setDownload] = useState("%loading");
         const [version, setV] = useState("0.0.0");

         useEffect(() => {
                  (async() => {
                           if (!get("x-download")) {
                                    getAppInstallerFile()
                                    .then((url) => {
                                             setDownload(url.download_url);
                                             setV(url.tagName);
                                             set("x-download", JSON.stringify(url));
                                    })
                                    .catch((e) => {
                                             console.log(e);
                                             setDownload("%error");
                                    });
                           } else {
                                    const url = JSON.parse(get("x-download") as string);
                                    setDownload(url.download_url);
                                    setV(url.tagName);
                           }
                  })()
         }, []);
         console.log(download);

         return (
                  <div className={`${dark ? "menu-d" : "menu"}`}>
                           <div className="flex justify-center items-center text-center">
                                    <img
                                             src={logo}
                                             alt="Logo"
                                             width={"100px"}
                                             draggable={false}
                                    />
                                    <h1 
                                             className={dark ? "text-blue-700" : "text-blue-900"}
                                             style={{
                                                      "fontSize": "100px",
                                                      "fontWeight": "bolder",
                                                      "fontFamily": "Segoe UI",
                                                      "marginLeft": "1rem"
                                             }}
                                    >AHQ Store</h1>
                                    <span 
                                             className="block mt-auto text-red-700"
                                             style={{
                                                      "fontSize": "30px",
                                                      "fontWeight": "bolder"
                                             }}
                                    >
                                             {version !== "0.0.0" ? String(`v${version}`) : "Installer"}
                                    </span>
                           </div>
                           <div className="h-[100%] w-[100%] flex flex-col justify-center items-center text-center">
                                    <button 
                                             className={`button`} 
                                             disabled={download === "%loading" || download === "%error"} 
                                             onClick={(event) => {
                                                      (event.target as HTMLButtonElement).innerHTML = "Thank you for downloading!";
                                                      (event.target as HTMLButtonElement).className = "button button-success";
                                                      setTimeout(() => {
                                                               (event.target as HTMLButtonElement).innerHTML = "Install";
                                                               (event.target as HTMLButtonElement).className = "button";
                                                      }, 3000);
                                                      window.location.href = download;
                                             }}
                                    >
                                             {download === "%loading" ? "Loading..." : ""}
                                             {download === "%error" ? "Something went wrong..." : ""}
                                             {download.startsWith("https://") ? "Install" : ""}
                                    </button>
                           </div>
                  </div>
         );
}