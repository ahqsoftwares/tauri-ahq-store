import { BiHome, BiExtension, BiLibrary } from "react-icons/bi";
import { BsCodeSlash } from "react-icons/bs";
import { FiSettings } from "react-icons/fi";
import { VscAccount } from "react-icons/vsc";
import { getCurrent } from "@tauri-apps/api/window";

interface prop {
  active: string;
  home: Function;
  dark: [boolean, Function];
  dev: boolean | undefined;
}

export default function nav(props: prop) {
  function darkMode(classes: Array<string>, dark: boolean) {
    return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
  }
  let { active, home: changePage, dark, dev } = props,
    [mode] = dark;

  let a = "",
    b = "",
    c = "",
    d = "",
    e = "",
    f = "";
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
      className={`w-[80px] h-screen flex flex-col items-center ${darkMode(
        ["nav", "bg-blue-super"],
        mode
      )}`}
    >
      <button className={`n-item ${a}`} onClick={() => changePage("home")}>
        <BiHome size={"2.5em"} />
      </button>

      <button className={`n-item ${b}`} onClick={() => changePage("apps")}>
        <BiExtension size={"2.5em"} />
      </button>

      <div className="mt-auto mb-auto"></div>

      {dev ? (
        <button
          className={`n-item ${e}`}
          onClick={() => changePage("developer")}
        >
          <BsCodeSlash size={"2.5em"} />
        </button>
      ) : (
        <></>
      )}

      <button className={`n-item ${f}`} onClick={() => changePage("library")}>
        <BiLibrary size="2.5em" />
      </button>

      <button className={`n-item ${d}`} onClick={() => changePage("user")}>
        <VscAccount size={"2.5em"} />
      </button>

      <button className={`n-item n-item-settings ${c}`} onClick={() => changePage("settings")}>
        <FiSettings size={"2.5em"} />
      </button>

      <div className="mb-[8px]"></div>
    </div>
  );
}
