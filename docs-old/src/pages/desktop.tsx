import { useEffect, useState } from "react";
import Nav from "../components/SpecialNav";

//Pages
import Home from "../components/home";
import About from "../components/about";

export default function MainPage({
  dark,
  path,
}: {
  dark: boolean;
  path: string;
}) {
  const [App, setApp] = useState<JSX.Element>(<Home dark={dark} />);
  const [page, setPage] = useState("home");

  function modifyState(page: string) {
    window.history.replaceState(null, "", `/${page}`);
  }

  useEffect(() => {
    if (path === "/docs") {
      setPage("docs");
    } else if (path === "/about") {
      setPage("about");
    }
  }, [path]);

  useEffect(() => {
    modifyState(page);
    switch (page) {
      case "docs":
        setApp(<></>);
        break;
      case "about":
        setApp(<About dark={dark} />);
        break;
      default:
        setApp(<Home dark={dark} />);
    }
  }, [page, dark]);

  return (
    <div className="w-screen h-screen flex dark:bg-gray-800">
      <Nav
        dark={dark}
        active={page}
        changePage={(page: string) => {
          setPage(page);
        }}
      />
      <div className="w-[100%] h-screen flex justify-center">{App}</div>
    </div>
  );
}
