import { useEffect, useState } from "react";
import "../../css/home/main.css";
import { getDownloadUrl } from "../constants";

export default function Home() {
  return <>
    <HomePage />
  </>;
}

function HomePage() {
  const [[msi, exe], setData] = useState(["", ""]);

  useEffect(() => {
    getDownloadUrl().then((data) => {
      return data.sort((a, b) => {
        if (a.name.includes(".msi")) return -1;
        if (b.name.includes(".exe")) return 1;
        return 0;
      }).map(({ browser_download_url: url }) => url) as [string, string];
    }).then(setData);
  }, []);

  return (
    <div className="home-cnt">
      <div className="home-intro">
        <div>
          <h2>Introducing</h2>
          <h1>AHQ Store</h1>
          <h3>
            The <strong>ONLY</strong> open sourced App Store
          </h3>
          <h4>
            <strong>Imagine an app store!</strong>
            <br />
            <span>
              The store manages your apps, updated them and lets you focus on
              the main development stuff. <strong>FOR FREE??</strong>
            </span>
            <br />
            <span>Just download the AHQ Store to enjoy the same benefits!</span>
          </h4>

          <div className="daisy-join daisy-join-vertical lg:daisy-join-horizontal mt-3">
            <button onClick={() => window.location.href = exe} disabled={exe == ""}>Download Setup</button>
            <button onClick={() => window.location.href = msi} disabled={msi == ""}>Download MSI</button>
          </div>
        </div>
        <div>
          <img src="/logo512.webp" />
        </div>
      </div>
    </div>
  );
}