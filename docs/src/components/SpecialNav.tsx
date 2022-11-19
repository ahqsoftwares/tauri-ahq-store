import { BiHome, BiExtension, BiBook } from "react-icons/bi";

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

  let a = "",
    b = "",
    c = "";
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
  }

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

      <button className={`n-item ${c} mb-5`} onClick={() => changePage("docs")}>
        <BiBook size={"2.5em"} />
      </button>
    </div>
  );
}
