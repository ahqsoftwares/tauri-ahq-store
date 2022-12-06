import { useEffect, useState } from "react";
import Nav from "../components/SpecialNav";

//Pages
import Home from "../components/home";

export default function MainPage({ dark }: { dark: boolean }) {
  const [App, setApp] = useState<JSX.Element>(<Home dark={dark} />);
  const [page, setPage] = useState("home");

  useEffect(() => {
    switch (page) {
      case "docs":
        setApp(<></>);
        break;
      case "apps":
        setApp(<></>);
        break;
      default:
        setApp(<Home dark={dark} />);
    }
  }, [page, dark]);

  return (
    <div className="w-screen h-screen flex">
      <Nav
        dark={dark}
        active={page}
        changePage={(page: string) => {
          setPage(page);
        }}
      />
      <div className="w-[100%] h-screen dark:bg-gray-800 flex justify-center">
        {App}
      </div>
    </div>
  );
}
