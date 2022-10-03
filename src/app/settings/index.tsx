import {useState, useEffect} from "react";
import {Auth, User, updateProfile} from "firebase/auth";

interface InitProps {
    dark: boolean,
    setDark: Function,
    auth: Auth,
}

export default function Init(props: InitProps) {
        const [user, setUser] = useState(props.auth.currentUser as User);
        const [dev, setDev] = useState(user?.displayName?.startsWith("(dev)"));

        console.log(user.displayName);

        async function Update() {
            await updateProfile(user, {
                displayName: !dev ? `(dev)${user?.displayName}` : user?.displayName?.replace("(dev)", "")
            });
            setUser(props.auth.currentUser as User);
            setDev(!dev);
            console.log(user);
        }

         function darkMode(classes: Array<string>, dark: boolean) {
                  return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
         }

         return (
                  
                  <div className={darkMode(["menu"], props.dark)}>
                           <div className="mt-2"></div>
                           
                           <div className={`${darkMode(["checkbox"], props.dark)}`} onClick={() => props.setDark(!props.dark)}>
                                    <div className="ml-3"></div>
                                    <h6>Dark Mode<p>Enables or disabled dark mode</p></h6>
                                    <div className="mx-auto"></div>
                                    <input className="slider" type={"range"} min="0" max="60" value={props.dark ? "55" : "5"} readOnly></input>
                                    <div className="mr-3"></div>
                           </div>

                           <div className={`${darkMode(["checkbox"], props.dark)} my-2`} onClick={() => {
                            Update()
                           }}>
                                    <div className="ml-3"></div>
                                    <h6>Developer Mode<p style={{"color": "red"}}>NOT IMPLEMENTED</p></h6>
                                    <div className="mx-auto"></div>
                                    <input className="slider" type={"range"} min="0" max="60" value={dev ? "55" : "5"} readOnly></input>
                                    <div className="mr-3"></div>
                           </div>

                           <></>
                  </div>
         )
}