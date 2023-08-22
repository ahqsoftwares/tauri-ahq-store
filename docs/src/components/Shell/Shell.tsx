import { useEffect, useState } from "react";

import Navigation from "../Navigation/Nav";
import Resolve from "../../router/resolve";

export default function Shell() {
  const [page, setPageData] = useState(<></>);
  const [special, setSpecial] = useState(false);

  useEffect(() => {
    if (document.location.pathname === "/.well-known/discord") {
      setSpecial(true);
      setPageData(<>dh=83790a0f96cc5927e34557ec683be10f6886e078</>);
    } else {
      Resolve().then((data) => {
        setPageData(data);

        const loading = document.querySelector("#loading");
        loading?.setAttribute("class", "hidden");
        loading?.setAttribute("id", "");
        try {
          (loading as Element).innerHTML = "";
        } catch (_) {
          //
        }
      });
    }
  }, []);

  return (
    <>
      {special ? {page} : <>
        <Navigation />

        <div className="p-2 mt-2 w-full">{page}</div>
      </>}
    </>
  );
}
