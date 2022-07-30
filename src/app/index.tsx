import {useState} from "react";
import Nav from "./Nav";
import "./index.css";

function render() {

         // eslint-disable-next-line react-hooks/rules-of-hooks
         let [page, changePage] = useState("home");

         switch (page) {
                  case "apps":
                           break;
                  case "settings":
                           break;
                  case "user":
                           break;
                  default:
                           break;
         }

         return (
                  <header className="bg-gray-300 flex">
                           <Nav active={page} home={(page: string) => changePage(page)} />
                           <div className="w-screen h-screen">
                                    <div className="text-center pt-auto">
                                             <h1 className="border-lime-900 text-red-700" style={{"fontSize": "100px"}}>{page[0].toUpperCase() + page.replace(page[0], "").toLowerCase()}</h1>
                                    </div>
                           </div>
                  </header>
         )
}

export default render;