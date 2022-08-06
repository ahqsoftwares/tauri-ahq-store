import {useState} from "react";
import Nav from "./Nav";
import "./index.css";
import User from "./client/index";

function Render(props: any) {
         const {auth} = props.data;
         console.log(auth);
         let [page, changePage] = useState("home"),
         [dark, setD] = useState(true),
         App: any = (props: any) => (<></>);

         switch (page) {
                  case "apps":
                           break;
                  case "settings":
                           break;
                  case "user":
                           App = User;
                           break;
                  default:
                           break;
         }

         return (
                  <header className={`apps${dark ? "-d": ""} flex transition-all`}>
                           <Nav active={page} home={(page: string) => changePage(page)} dark={[dark, setD]}/>
                           <div className="w-screen h-screen">
                                    <div className="text-center pt-auto">
                                             <h1 className="border-lime-900 text-red-700" style={{"fontSize": "100px"}}>{page[0].toUpperCase() + page.replace(page[0], "").toLowerCase()}</h1>
                                    </div>
                                    <App auth={auth} />
                           </div>
                  </header>
         )
}

export default Render;