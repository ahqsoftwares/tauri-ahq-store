import {BiHome, BiExtension} from "react-icons/bi";
import {FiSettings} from "react-icons/fi";
import {VscAccount} from "react-icons/vsc";


interface prop {
         active: string,
         home: Function
}

export default function nav(props: prop) {
         const {active, home: changePage} = props;
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
         
         return (
                  <div className="bg-white w-[80px] h-screen flex flex-col items-center nav">
                           <button className={`n-item ${a}`} onClick={() => changePage("home")}>
                                    <BiHome size={"3em"}/>
                           </button>
                           <button className={`n-item ${b}`} onClick={() => changePage("apps")}>
                                    <BiExtension size={"3em"} />
                           </button>
                           
                           <div className="mt-auto mb-auto"></div>
                           <button className={`n-item ${d}`} onClick={() => changePage("user")}>
                                    <VscAccount size={"3em"} />
                           </button>
                           <button className={`n-item ${c}`} onClick={() => changePage("settings")}>
                                    <FiSettings size={"3em"} />
                           </button>
                           <div className="mb-[8px]"></div>
                  </div>
         );
}