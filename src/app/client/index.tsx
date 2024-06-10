/* eslint-disable react-hooks/exhaustive-deps */

/*
React && Native
*/
import { useEffect } from "react";
import React from "react";

/*
Firebase API
*/
import { Auth, logOut } from "../../auth/index";

/*
Database Refs
*/
import GeneralUser from "./user.png";
import Loading from "./loading.gif";
import { BiLogOut } from "react-icons/bi";
import { invoke } from "@tauri-apps/api/core";
import { FaGithub } from "react-icons/fa6";
import { startLogin } from "../../auth/github";

/*
Interfaces
*/
interface UserProps {
  auth: Auth;
  dark: boolean;
  setPage: React.Dispatch<React.SetStateAction<string>>;
}

export default function Init(props: UserProps) {
  let { auth, setPage } = props;

  const user = auth.currentUser?.avatar_url || Loading;
  const name = auth.currentUser?.name || "Guest";

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
      if (auth.currentUser) {
        invoke("open", {
          url: `https://github.com/${auth.currentUser.login}`,
        });
      }
    });
  }, []);

  return (
    <>
      <div className="menu pb-2">
        <div className="user pb-2">
          <div className="img" id="img">
            <img src={auth.currentUser ? user : GeneralUser} alt="Avatar" />
            <div
              className={`div ${props.dark ? "" : "div-l"} ${auth.currentUser ? "" : "hidden"}`}
              id="drop"
            >
              <h1 className="text">View profile</h1>
            </div>
          </div>
          <div className="flex flex-col text-center mt-2 name">
            <div className="flex justify-center">
              <h1>{name || "Guest"}</h1>
            </div>
            <h6>
              {auth.currentUser &&
                (auth.currentUser?.email || `@${auth.currentUser?.login}`)}
            </h6>
          </div>
        </div>
        <Actions auth={auth} setPage={setPage} />
      </div>
    </>
  );
}

function Actions(props: {
  auth: Auth;
  setPage: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { auth, setPage } = props;
  return (
    <div className="flex flex-col">
      <div className="flex w-[100%] flex-col">
        <button
          className={
            auth.currentUser
              ? "hidden"
              : "mx-auto flex items-center text-center justify-center dui-btn dui-btn-primary"
          }
          style={{
            minWidth: "30vw",
            maxWidth: "30vw",
            minHeight: "7vh",
            maxHeight: "7vh",
          }}
          onClick={() => startLogin(auth)}
        >
          <FaGithub size="2.5em" />
          <p className="mx-2">Login</p>
        </button>
        <button
          className={
            auth.currentUser
              ? "mx-auto flex items-center text-center justify-center dui-btn dui-btn-error"
              : "hidden"
          }
          onClick={() => {
            localStorage.removeItem("password");
            logOut(auth);
            setPage("home");
          }}
          style={{
            minWidth: "30vw",
            maxWidth: "30vw",
            minHeight: "7vh",
            maxHeight: "7vh",
          }}
        >
          <BiLogOut size="2.5em" />
          <p className="mx-2">Logout</p>
        </button>
      </div>
    </div>
  );
}
