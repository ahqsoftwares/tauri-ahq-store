
//Components
import { useEffect, useState } from "react";
import InstalledAppsMenu from "./components/Style";

interface LibraryProps {
         dark: boolean
}

export default function Library(props: LibraryProps) {
         const {
                  dark
         } = props;

         const [status, setStatus] = useState("Checking status...");

         useEffect(() => {
                  setStatus("You are up to date!");
         }, []);

         function darkMode(classes: Array<string>) {
                  return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
         }

         return (
                  <div className={`${darkMode(["menu"])}`}>
                           <div className={`mt-[1rem] min-w-[98%] rounded-lg shadow-xl ${dark ? "bg-gray-700": "bg-gray-100"} flex flex-col`}>
                                    <div className="px-3 pt-1 flex flex-row text-center items-center justify-center mb-[1rem]">
                                             <h1 className={`${dark ? "text-slate-200" : "text-slate-800"} text-2xl`}>{status}</h1>
                                             <button className="button ml-auto" style={{"maxWidth": "10rem", "maxHeight": "30px"}}>Check for Updates</button>
                                    </div>
                           </div>
                           <InstalledAppsMenu 
                                    dark={props.dark}
                                    onClick={() => {

                                    }}
                           />
                           <div className="mb-[2rem]"></div>
                  </div>
         );
}