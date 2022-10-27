//React
import {useState} from "react";
import {Auth, User, updateProfile} from "firebase/auth";

//packages
import Modal from "react-modal";
import Toast from "../resources/toast";

//Tauri
import { sendNotification } from "@tauri-apps/api/notification";
import { BiMoon, BiSun } from "react-icons/bi";
import { BsCodeSlash } from "react-icons/bs";

interface InitProps {
    dark: boolean,
    setDark: Function,
    auth: Auth,
    setDev: Function
}

export default function Init(props: InitProps) {
    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: "35%",
            minWidth: "35%",
            maxHeight: "30%",
            minHeight: "30%",
            transition: "all 500ms linear",
            borderRadius: "20px",
            borderColor: props.dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
            backgroundColor: props.dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
        },
        overlay: {
            backgroundColor: !props.dark ? "rgb(55, 65, 81, 0.5)" : "rgb(107, 114, 128, 0.75)",
            opacity: "1"
        }
    };
        Modal.setAppElement("body");
        const [user, setUser] = useState(props.auth.currentUser as User);
        const [show, setShow] = useState(false);
        const [dev, setDev] = useState(user?.displayName?.startsWith("(dev)"));

        console.log(user.displayName);

        async function Update() {
            const toast = Toast("Please Wait...", "warn", "never");
            try {
                if (props.auth?.currentUser?.emailVerified) {
                    setShow(true);
                    await updateProfile(user, {
                        displayName: !dev ? `(dev)${user?.displayName}` : user?.displayName?.replace("(dev)", "")
                    });
                    toast?.edit(`Successfully ${!dev ? "enabled" : "disabled"} developer mode!`, "success");
                    setUser(props.auth.currentUser as User);
                    setDev(!dev);
                    props.setDev(!dev);
                    setShow(false);
                }
            } catch (_e) {
                toast?.edit("Failed to enable developer mode!", "danger");
                sendNotification("Could not update data!");
            }

            setTimeout(() => {
                toast?.unmount();
            }, 5000);
        }

         function darkMode(classes: Array<string>, dark: boolean) {
                  return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
         }

         return (
            <>
                <Modal
                    isOpen={show}
                    style={customStyles}
                >
                    <div className="flex flex-col items-center text-center justify-center">
                        <div className="my-auto">
                            <h1 className={`block mt-[45%] text-3xl ${props.dark ? "text-slate-300" : "text-slate-900"}`}>Please wait...</h1>
                        </div>
                    </div>
                </Modal>
                  
                  <div className={darkMode(["menu"], props.dark)}>
                           <div className="mt-2"></div>
                           
                           <div className={`${darkMode(["checkbox"], props.dark)}`} onClick={() => props.setDark(!props.dark)}>
                                    <div className="ml-3"></div>
                                    
                                    <div className={`flex items-center justify-center ${props.dark ? "text-slate-300" : "text-slate-700"}`}>
                                        {props.dark ? <BiSun size="2.5em"/> : <BiMoon size="2.5em"/>}
                                    </div>
                                    
                                    <div className="ml-3"></div>

                                    <h6>Dark Mode<p>Enables or disables dark mode</p></h6>

                                    <div className="mx-auto"></div>

                                    <input className="slider" type={"range"} min="0" max="60" value={props.dark ? "55" : "5"} readOnly></input>
                                    
                                    <div className="mr-3"></div>
                           </div>

                           <div className={`${darkMode(["checkbox"], props.dark)} my-2`} onClick={() => {
                            Update()
                           }}>
                                    <div className="ml-3"></div>

                                    <div className={`flex items-center justify-center ${props.dark ? "text-slate-300" : "text-slate-700"}`}>
                                        <BsCodeSlash size="2.5em"/>
                                    </div>
                                    
                                    <div className="ml-3"></div>

                                    {props.auth?.currentUser?.emailVerified ? 
                                        <h6>Developer Mode<p>Allows you to publish windows apps</p></h6>
                                    :
                                        <h6>Developer Mode<p style={{"color": props.dark ? "red" : "darkred"}}>(DISABLED, VERIFY EMAIL) Allows you to publish windows apps</p></h6>
                                    }

                                    <div className="mx-auto"></div>
                                    
                                    <input className="slider" type={"range"} min="0" max="60" value={dev ? "55" : "5"} readOnly></input>
                                    
                                    <div className="mr-3"></div>
                           </div>

                           <></>
                  </div>
                </>
         )
}