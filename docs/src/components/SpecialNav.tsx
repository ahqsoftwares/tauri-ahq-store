import { HiDocument, HiOutlineDocument } from "react-icons/hi";
import {
  AiFillHome,
  AiFillInfoCircle,
  AiOutlineHome,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { RiApps2Fill, RiApps2Line } from "react-icons/ri";
import { useEffect, useState } from "react";

interface prop {
  active: string;
  changePage: Function;
  dark: boolean;
}

export default function Nav(props: prop) {
  function darkMode(classes: Array<string>, dark: boolean) {
    return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
  }
  let { active, changePage, dark: mode } = props;

  const [secretKeyUsed, setKey] = useState(false);

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      //If the key is Esc
      if (e.key === "Escape") {
        setKey(true);
      }
    });
  }, []);

  let a = "",
    b = "",
    c = "",
    d = "";
  switch (active) {
    case "home":
      a = "active";
      break;
    case "apps":
      b = "active";
      break;
    case "docs":
      c = "active";
      break;
    case "about":
      d = "active";
      break;
  }

  (
    document.querySelector("title") as HTMLTitleElement
  ).innerHTML = `${active[0].toUpperCase()}${active.replace(
    active[0],
    "",
  )} - AHQ Store`;

  return (
    <div
      className={`w-[80px] h-[97%] rounded-lg my-auto ml-2 flex flex-col items-center ${darkMode(
        ["nav", "bg-blue-super"],
        mode,
      )}`}
    >
      <button className={`n-item ${a}`} onClick={() => changePage("home")}>
        {a === "active" ? (
          <AiFillHome size={"2.5em"}></AiFillHome>
        ) : (
          <AiOutlineHome size={"2.5em"} />
        )}
      </button>

      {secretKeyUsed ? (
        <button className={`n-item ${b}`} onClick={() => changePage("apps")}>
          {b === "active" ? (
            <RiApps2Fill size={"2.5em"} />
          ) : (
            <RiApps2Line size={"2.5em"} />
          )}
        </button>
      ) : (
        <></>
      )}

      <div className="mt-auto mb-auto"></div>

      {secretKeyUsed ? (
        <button className={`n-item ${c}`} onClick={() => changePage("docs")}>
          {c === "active" ? (
            <HiDocument size={"2.5em"} />
          ) : (
            <HiOutlineDocument size={"2.5em"} />
          )}
        </button>
      ) : (
        <></>
      )}

      <button
        className={`n-item ${d} mb-5`}
        onClick={() => changePage("about")}
      >
        {d === "active" ? (
          <AiFillInfoCircle size={"2.5em"} />
        ) : (
          <AiOutlineInfoCircle size={"2.5em"} />
        )}
      </button>
    </div>
  );
}
