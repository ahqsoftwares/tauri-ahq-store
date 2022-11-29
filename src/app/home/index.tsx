import React, { useEffect, useRef, useState } from "react";
import { BiLibrary, BiExtension } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { VscAccount } from "react-icons/vsc";
import { didGreet, greeted } from "../resources/utilities/greet";
import Button from "./components/Button";

function darkMode(classes: Array<string>, dark: boolean) {
  return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
}

interface HomeProps {
  dark: boolean,
  setPage: React.Dispatch<React.SetStateAction<string>>
}

export default function Home(props: HomeProps) {
  const {
    dark,
    setPage
  } = props;

  const [greet, setGreet] = useState(didGreet());
  const textBox = useRef<HTMLHeadingElement>("" as any);

  useEffect(() => {
    if (!greet) {
      setTimeout(() => {
        setGreet(true);
        greeted();
        const greetText = "What would you like to do today!";
        for (let i = 0; i < greetText.length; i++) {
          const h1 = textBox.current as HTMLHeadElement;
          setTimeout(() => {
            if (i === 0) {
              h1.innerHTML = "";
            }
            setTimeout(() => {
              h1.innerHTML += greetText[i];
            }, 20 * i);
          }, 3);
        }
      }, 1500);
    }
  }, [greet]);

  return (
    <div className={`${darkMode(["menu"], props.dark)} flex flex-col justify-center`}>
      <h1 ref={textBox} className={`text-3xl ${dark ? "text-slate-300" : "text-slate-600"} mb-2`} style={{"transition": "all 125ms fade-in"}}>
        {greet ? "What would you like to do today!" : "Welcome to AHQ Store"}
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
            Icon={VscAccount}
            title="Account"
            description="Customise your account"
            onClick={() => setPage("user")}
          />
          <Button 
            dark={dark}
            Icon={FiSettings}
            title="Settings"
            description="Set your preferences"
            onClick={() => setPage("settings")}
          />
        </div>
      </div>
    </div>
  );
}
