import {BiHome, BiExtension} from "react-icons/bi";
import {FiSettings} from "react-icons/fi";
import {VscAccount} from "react-icons/vsc";
import { getCurrent } from "@tauri-apps/api/window";


interface prop {
         active: string,
         home: Function,
         dark: [boolean, Function]
}

export default function nav(props: prop) {
         function darkMode(classes: Array<string>, dark: boolean) {
                  return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
         }
         let
         {active, home: changePage, dark} = props,
         [mode] = dark;

         let a="", b="", c="", d="";
         switch (active) {
                  case "home":
                           a="active";
                           break;
                  case "apps":
                           b="active";
                           break;
                  case "settings":
                           c="active";
                           break;
                  default:
                           d="active";
                           break;
         }

         getCurrent().setTitle(`${active[0].toUpperCase()}${active.replace(active[0], "").toLowerCase()} - AHQ Store`);
         
         return (
                  <div className={`w-[80px] h-screen flex flex-col items-center ${darkMode(["nav", "bg-blue-super"], mode)}`}>
                           
                           <button className={`n-item ${a}`} onClick={() => changePage("home")}>
                                    <BiHome size={"2.5em"}/>
                           </button>
                           
                           <button className={`n-item ${b}`} onClick={() => changePage("apps")}>
                                    <BiExtension size={"2.5em"} />
                           </button>
                           
                           <div className="mt-auto mb-auto"></div>

                           <button className={`n-item ${d}`} onClick={() => changePage("user")}>
                                    <VscAccount size={"2.5em"} />
                           </button>

                           <button className={`n-item ${c}`} onClick={() => changePage("settings")}>
                                    <FiSettings size={"2.5em"} />
                           </button>

                           <div className="mb-[8px]"></div>

                  </div>
         );
}