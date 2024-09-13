//React
import React, { useEffect, useRef, useState } from "react";

//image
import AHQStore from "./index.png";

//components
import Button from "./components/Button";

//API
import { didGreet, greeted } from "../resources/utilities/greet";
import { getData, setData } from "../resources/utilities/database";
import { Auth } from "../../auth";
import { getAppVersion } from "../resources/api/version";
import getWindows from "../resources/api/os";
import { apps, dev, library, user } from "../icons";
import { FcSettings } from "react-icons/fc";

function darkMode(classes: Array<string>, dark: boolean) {
  let newClasses: string[] = [];

  classes.forEach((c) => {
    newClasses.push(c);
    if (dark) {
      newClasses.push(c + "-dark");
    }
  });

  return newClasses.join(" ");
}

interface HomeProps {
  dark: boolean;
  setPage: React.Dispatch<React.SetStateAction<string>>;
  auth: Auth;
  dev: boolean;
}

export default function Home(props: HomeProps) {
  const [userIcon, setUserIcon] = useState<string>(
    (getData("x-icon") as string) || "",
  );

  const { dark, setPage, auth } = props;

  useEffect(() => {
    setData("x-icon", auth.currentUser?.avatar_url || "");
    setUserIcon(auth.currentUser?.avatar_url || "");
  }, [auth.currentUser]);

  const [greet, setGreet] = useState(didGreet());
  const version = getAppVersion();
  const [first] = useState(!didGreet());
  const textBox = useRef<HTMLHeadingElement>("" as any);

  useEffect(() => {
    if (!greet) {
      greeted();
      setTimeout(() => {
        setGreet(true);
        const greetText = "What would you like to do today!";
        greetText.split("").forEach((d, i) => {
          const h1 = textBox.current;
          try {
            if (i === 0) {
              try {
                h1.innerHTML = d;
              } catch (_) { }
            }
            setTimeout(() => {
              try {
                if (i != 0) h1.innerHTML += d;
              } catch (_) { }
            }, 50 * i);
          } catch (_) { }
        });
      }, 1750);
    }
  }, [greet]);

  return (
    <div
      className={`${darkMode(
        ["menu"],
        props.dark,
      )} flex flex-col justify-center`}
    >
      <div className="flex justify-center items-center mb-auto mt-3">
        <img src={AHQStore} alt="Logo" width={"125px"} draggable={false} />
        <h1
          className={`block ml-2 style-h1 ${props.dark ? "style-h1-d" : ""}`}
          style={{
            fontSize: "100px",
            color: props.dark ? "white" : "rgb(185,28,28)",
          }}
        >
          AHQ Store
        </h1>
        <span
          className={`block mt-auto ${props.dark ? "text-base-content" : "text-black"} ml-2`}
          style={{ fontSize: "40px", fontWeight: "10px" }}
        >
          v{version}
        </span>
      </div>
      <h1
        ref={textBox}
        className={`text-3xl ${dark ? "text-slate-300" : "text-slate-600"
          } mb-2`}
        style={{ transition: "all 125ms fade-in" }}
      >
        {!first && greet ? "What would you like to do today!" : "Welcome!"}
      </h1>
      <div className="flex flex-col mb-auto">
        <div className="flex flex-row">
          <Button
            dark={dark}
            Icon={apps}
            title={"Apps"}
            description="Explore Apps"
            onClick={() => setPage("apps")}
          />
          <Button
            dark={dark}
            Icon={library}
            title="Library"
            calibrate="1.5"
            description="Check for app updates"
            onClick={() => setPage("library")}
          />
        </div>
        <div className="flex flex-row">
          <Button
            dark={dark}
            Icon={userIcon === "" ? user : userIcon}
            title="Account"
            description="Your account"
            onClick={() => setPage("user")}
          />
          <Button
            dark={dark}
            Icon={Math.random() > 0.01 ? FcSettings : getWindows()}
            no50
            title="Settings"
            calibrate="1"
            description="Set your preferences"
            onClick={() => {
              document.getElementById("settings")?.click();
            }}
          />
        </div>
        {props.dev ? (
          <div className="flex justify-center items-center mb-auto mt-3">
            <Button
              dark={dark}
              Icon={() => <img src={dev} className="rotate-[40deg]" />}
              no50
              calibrate="1.5"
              title="Developer"
              description="Hola! Hello!"
              onClick={() => setPage("developer")}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
