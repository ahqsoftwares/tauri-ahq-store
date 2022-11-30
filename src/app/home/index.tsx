//React
import React, { useEffect, useRef, useState } from "react";
import { BiLibrary, BiExtension } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { VscAccount } from "react-icons/vsc";

//components
import Button from "./components/Button";
import base from "../server";

//API
import { didGreet, greeted } from "../resources/utilities/greet";
import { fetch } from "@tauri-apps/api/http";
import { getData, setData } from "../resources/utilities/database";
import { Auth } from "firebase/auth";
import getWindows from "../resources/api/os";

function darkMode(classes: Array<string>, dark: boolean) {
  return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
}

interface HomeProps {
  dark: boolean,
  setPage: React.Dispatch<React.SetStateAction<string>>,
  auth: Auth
}

export default function Home(props: HomeProps) {
  const [userIcon, setUserIcon] = useState<string>(getData("x-icon") as string || "");


  const {
    dark,
    setPage,
    auth
  } = props;

  fetch(`${base}`, {
    headers: {
      uid: auth.currentUser?.uid as string
    },
    method: "GET"
  })
  .then(({ data }: any) => { 
    setData("x-icon", data);
    setUserIcon(data);
  })
  .catch(console.log);

  const [greet, setGreet] = useState(didGreet());
  const first = didGreet();
  const textBox = useRef<HTMLHeadingElement>("" as any);

  useEffect(() => {
    if (!greet) {
      setTimeout(() => {
        setGreet(true);
        greeted();
        const greetText = "What would you like to do today!";
        for (let i = 0; i < greetText.length; i++) {
          const h1 = textBox.current as HTMLHeadElement;
          if (i === 0) {
            h1.innerHTML = "";
          }
          setTimeout(() => {
            h1.innerHTML += greetText[i];
          }, 50 * i);
        }
      }, 1500);
    }
  }, [greet]);

  return (
    <div className={`${darkMode(["menu"], props.dark)} flex flex-col justify-center`}>
      <h1 ref={textBox} className={`text-3xl ${dark ? "text-slate-300" : "text-slate-600"} mb-2`} style={{"transition": "all 125ms fade-in"}}>
        {(!first && greet) ? "What would you like to do today!" : "Welcome to AHQ Store"}
      </h1>
      <div className="flex flex-col">
        <div className="flex flex-row">
          <Button 
            dark={dark}
            Icon={BiExtension}
            title={"Apps"}
            description="Explore Apps"
            onClick={() => setPage("apps")}
          />
          <Button 
            dark={dark}
            Icon={BiLibrary}
            title="Library"
            description="Check for app updates"
            onClick={() => setPage("library")}
          />
        </div>
        <div className="flex flex-row">
          <Button 
            dark={dark}
            Icon={userIcon === "" ? VscAccount : userIcon}
            title="Account"
            description="Customise your account"
            onClick={() => setPage("user")}
          />
          <Button 
            dark={dark}
            Icon={Math.random() > 0.01 ? FiSettings : getWindows()}
            no50
            title="Settings"
            description="Set your preferences"
            onClick={() => setPage("settings")}
          />
        </div>
      </div>
    </div>
  );
}
