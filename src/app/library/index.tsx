//PUB libraries
import { useEffect, useState } from "react";
import Modal from "react-modal";

//Components
import InstalledAppsMenu from "./components/Style";
import AppList from "./components/allAppsList";

interface LibraryProps {
         dark: boolean
}

export default function Library(props: LibraryProps) {
         const {
                  dark
         } = props;

         const customStyles = {
                  content: {
                      top: '50%',
                      left: '50%',
                      right: 'auto',
                      bottom: 'auto',
                      marginRight: '-50%',
                      transform: 'translate(-50%, -50%)',
                      width: "95%",
                      height: "90%",
                      transition: "all 500ms linear",
                      "backgroundColor": props.dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
                      borderColor: props.dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
                  },
                  overlay: {
                      backgroundColor: !props.dark ? "rgb(55, 65, 81, 0.5)" : "rgb(107, 114, 128, 0.75)"
                  }
         };

         Modal.setAppElement("body");

         const [status, setStatus] = useState("Checking status..."),
         
         [appList, setAppList] = useState(false);

         useEffect(() => {
                  setStatus("You are up to date!");
         }, []);

         function darkMode(classes: Array<string>) {
                  return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
         }

         return (
                  <>
                           <Modal
                                    isOpen={appList}
                                    style={customStyles}
                           >
                                    <AppList 
                                             dark={props.dark}
                                             change={() => {
                                                      setAppList(false);
                                             }}
                                    />
                           </Modal>

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
                                                      setAppList(true);
                                             }}
                                    />
                                    <div className="mb-[1.5rem]"></div>
                           </div>
                  </>
         );
}