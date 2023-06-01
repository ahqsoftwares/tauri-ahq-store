import { BsGear, BsFillGearFill, BsThreeDotsVertical } from "react-icons/bs";
import { MdAccountCircle, MdOutlineAccountCircle } from "react-icons/md";
import {
  AiFillExperiment,
  AiFillHome,
  AiOutlineExperiment,
  AiOutlineHome,
} from "react-icons/ai";
import { RiApps2Fill, RiApps2Line } from "react-icons/ri";
import { IoLibraryOutline, IoLibrarySharp } from "react-icons/io5";

import { getCurrent } from "@tauri-apps/api/window";

import drag from "./drag";
import { useEffect } from "react";

interface prop {
  active: string;
  home: Function;
  dark: [boolean, Function];
  dev: boolean | undefined;
  horizontal: boolean;
  top: boolean;
}

export default function Nav(props: prop) {
  function darkMode(classes: Array<string>, dark: boolean) {
    return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
  }
  let { active, home: changePage, dark, dev } = props,
    [mode] = dark;

  const horizontal = "n-item-h ";

  useEffect(() => {
    if (props.horizontal) {
      drag(document.getElementById("sidebar"));
    }
  }, [props.horizontal]);

  let a = props.horizontal ? horizontal : "",
    b = props.horizontal ? horizontal : "",
    c = props.horizontal ? horizontal : "",
    d = props.horizontal ? horizontal : "",
    e = props.horizontal ? horizontal : "",
    f = props.horizontal ? horizontal : "";
  switch (active) {
    case "home":
      a = "active";
      break;
    case "apps":
      b = "active";
      break;
    case "settings":
      c = "active";
      break;
    case "developer":
      e = "active";
      break;
    case "library":
      f = "active";
      break;
    default:
      d = "active";
      break;
  }

  getCurrent().setTitle(
    `${active.replace("user", "account")[0].toUpperCase()}${active
      .replace("user", "ccount")
      .replace(active[0], "")
      .toLowerCase()} - AHQ Store`
  );

  return (
    <div
      className={`${props.horizontal ? "absolute w-[98vh]" : "w-[80px]"} ${
        props.horizontal ? "h-[15vh] px-[1rem]" : "h-[98vh]"
      } my-auto ${props.horizontal ? "mt-2" : "ml-2"} rounded-lg flex ${
        props.horizontal ? "flex-row" : "flex-col"
      } items-center ${darkMode(
        ["nav", "bg-blue-super", ...(props.horizontal ? ["nav-h"] : [])],
        mode
      )}`}
      id={"sidebar"}
    >
      {props.horizontal ? (
        <span id="sidebarheader" className="text-white hover:cursor-move">
          <BsThreeDotsVertical size={"2.5em"} />
        </span>
      ) : (
        <></>
      )}
      <button className={`n-item ${a}`} onClick={() => changePage("home")}>
        {a === "active" ? (
          <AiFillHome size={"2.5em"}></AiFillHome>
        ) : (
          <AiOutlineHome size={"2.5em"} />
        )}
      </button>

      <button className={`n-item ${b}`} onClick={() => changePage("apps")}>
        {b === "active" ? (
          <RiApps2Fill size={"2.5em"} />
        ) : (
          <RiApps2Line size={"2.5em"} />
        )}
      </button>

      <div className={props.horizontal ? "mx-auto" : "mt-auto mb-auto"}></div>

      {dev ? (
        <button
          className={`n-item ${e}`}
          onClick={() => changePage("developer")}
        >
          {e === "active" ? (
            <AiFillExperiment size={"2.5em"} />
          ) : (
            <AiOutlineExperiment size={"2.5em"} />
          )}
        </button>
      ) : (
        <></>
      )}

      <button className={`n-item ${f}`} onClick={() => changePage("library")}>
        {f === "active" ? (
          <IoLibrarySharp size="2.5em" />
        ) : (
          <IoLibraryOutline size="2.5em" />
        )}
      </button>

      <button className={`n-item ${d}`} onClick={() => changePage("user")}>
        {d === "active" ? (
          <MdAccountCircle size={"2.8em"} />
        ) : (
          <MdOutlineAccountCircle size={"2.8em"} />
        )}
      </button>

      <button
        className={`n-item n-item-settings ${
          c === "active" ? `active active-settings` : ""
        }`}
        id="settings"
        onClick={() => changePage("settings")}
      >
        {c === "active" ? (
          <BsFillGearFill size={"2.5em"} />
        ) : (
          <BsGear size={"2.5em"} />
        )}
      </button>

      <div className="mb-[8px]"></div>
    </div>
  );
}
