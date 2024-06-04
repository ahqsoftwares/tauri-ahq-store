/* eslint-disable react-hooks/exhaustive-deps */

/*
React && Native
*/
import { useEffect, useState } from "react";

/*
Firebase API
*/
import { Auth, logOut } from "../../auth";

/*
Database Refs
*/
import GeneralUser from "./user.png";
import Loading from "./loading.gif";
import { BiLogOut } from "react-icons/bi";
import { invoke } from "@tauri-apps/api/core";
import { FaGithub } from "react-icons/fa6";

/*
Interfaces
*/
interface UserProps {
  auth: Auth;
  dark: boolean;
}

export default function Init(props: UserProps) {
  let { auth } = props;

  let [user, setUser] = useState(Loading),
    [name, setName] = useState("");

  useEffect(() => {
    const image = document.getElementById("img") as HTMLElement,
      drop = document.getElementById("drop") as HTMLElement;

    image.addEventListener("mouseover", () => {
      drop.setAttribute("style", "opacity: 0.9");
    });
    image.addEventListener("mouseleave", () => {
      drop.setAttribute("style", "opacity: 0.0");
    });
    image.addEventListener("click", async () => {

    });
  }, []);

  return (
    <>
      <div className="menu pb-2">
        <div className="user pb-2">
          <div className="img" id="img">
            <img
              src={auth.currentUser ? user : GeneralUser}
              alt="Avatar"
            />
            {auth.currentUser &&
              <div className={`div ${props.dark ? "" : "div-l"}`} id="drop">
                <h1 className="text">View picture</h1>
              </div>
            }
          </div>
          <div className="flex flex-col text-center mt-2 name">
            <div className="flex justify-center">
              <h1>{name || "Guest"}</h1>
            </div>
            <h6>{auth.currentUser?.email}</h6>
          </div>
        </div>
        <Actions auth={auth} />
      </div>
    </>
  );
}

function Actions(props: { auth: Auth }) {
  const { auth } = props;
  return (
    <div className="flex flex-col">
      <div className="flex w-[100%] flex-col">
        <button
          className={auth.currentUser ? "hidden" : "mx-auto flex items-center text-center justify-center dui-btn dui-btn-primary"}
          style={{
            minWidth: "30vw",
            maxWidth: "30vw",
            minHeight: "7vh",
            maxHeight: "7vh",
          }}
        >
          <FaGithub size="2.5em" />
          <p className="mx-2">Login</p>
        </button>
        <button
          className={auth.currentUser ? "mx-auto flex items-center text-center justify-center dui-btn dui-btn-error" : "hidden"}
          onClick={() => {
            localStorage.removeItem("password");
            logOut(auth);
          }}
          style={{
            minWidth: "30vw",
            maxWidth: "30vw",
            minHeight: "7vh",
            maxHeight: "7vh",
          }}
        >
          <BiLogOut size="2.5em" />
          <p className="mx-2">LogOut</p>
        </button>
      </div>
    </div>
  );
}