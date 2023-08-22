import { useEffect, useState } from "react";

import Navigation from "../Navigation/Nav";
import Resolve from "../../router/resolve";

export default function Shell() {
  const [page, setPageData] = useState(<></>);

  useEffect(() => {
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
  }, []);

  return (
    <>
      <Navigation />

      <div className="p-2 mt-2 w-full">{page}</div>
    </>
  );
}
