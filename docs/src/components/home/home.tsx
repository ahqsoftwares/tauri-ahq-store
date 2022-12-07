import getAppInstallerFile from "../../components/api/model/fetchDownload";
import { get, set } from "../../components/api/database";

import UAParser from "ua-parser-js";
import logo from "../logo.png";

import { useEffect, useState } from "react";

interface HomeProps {
  dark: boolean;
}

export default function Home(props: HomeProps) {
  const { dark } = props;

  const [download, setDownload] = useState("%loading");
  const [version, setV] = useState("0.0.0");
  const parser = new UAParser();
  const os = parser.getOS();

  useEffect(() => {
    (async () => {
      if (!get("x-download")) {
        getAppInstallerFile()
          .then((url) => {
            setDownload(url.download_url);
            setV(url.tagName);
            set("x-download", JSON.stringify(url));
          })
          .catch((e) => {
            console.log(e);
            setDownload("%error");
          });
      } else {
        const url = JSON.parse(get("x-download") as string);
        setDownload(url.download_url);
        setV(url.tagName);
      }
    })();
  }, []);

  return (
    <div className={`${dark ? "menu-d" : "menu"}`}>
      <div className="flex justify-center items-center text-center">
        <img src={logo} alt="Logo" width={"100px"} draggable={false} />
        <h1
          className={dark ? "text-blue-700" : "text-blue-900"}
          style={{
            fontSize: "100px",
            fontWeight: "bolder",
            fontFamily: "Segoe UI",
            marginLeft: "1rem",
          }}
        >
          AHQ Store
        </h1>
        <span
          className="block mt-auto text-red-700"
          style={{
            fontSize: "30px",
            fontWeight: "bolder",
          }}
        >
          {version !== "0.0.0" ? String(`v${version}`) : "Installer"}
        </span>
      </div>
      <div className="h-[100%] w-[100%] flex flex-col justify-center items-center text-center">
        <button
          className={`button flex justify-center items-center text-center`}
          disabled={download === "%loading" || download === "%error" || os.name !== "Windows"}
          id="btn"
          style={{
            minHeight: "3.5rem",
            maxHeight: "3.5rem",
          }}
          onClick={() => {
            (
              document.getElementById("btn") as HTMLButtonElement
            ).innerHTML = `Thank you for downloading!`;
            (document.getElementById("btn") as HTMLButtonElement).classList.add(
              "button-success"
            );
            setTimeout(() => {
              (
                document.getElementById("btn") as HTMLButtonElement
              ).innerHTML = `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAEcUlEQVRoge1Zv6sdRRg9c9+7IA9ijIohCaJvd55CxESDhVqI/4CFgq1YiYJ/goWFYBpJKdgpWIm1na1NtAjykiIgFolNYhKFFLl3v2Oxv76Z/WZ296okgfvBct/O7syc833nzMx9F9jGNrbxUIe73wDieOsin1y7lV+AXhwOWKGg8PaqkvM/vr53LX5/936AfPsqn9pZwVeoDlg5T9CL0JPwwtVjTgAhQCEIgCAWC3cWwBvxWP8bgXcOeWKxAw/XXALvHLwQnms+WpEgHQiCNUqArD+btvpqn/M1a55/ReDs1zdOyXLluXZeKB6EP3z/5LsAsNjF9e5FAnAhoBoT+zYMADcvdYR2NiLw4re3jy2Xq4LOvQCR00IUBApWfK7i+girBmEzeS4IhplmREJnHWEbEmObBM59f/NVVrwAh5eA9SOEq/UYlLW+0Gq1zVwKfCSJFuSYdHTFJhOg8Bs4HKj7cECJM9g/S4NPSGeo9Vg62eQsEsR8P3k4CYQhcImIJRn0nyGhCdLJSChFoAcvDfDmCiQkoaSsOg9BNS8FhPLS2aQC4YQB4EhO7cyiwOnEm0aNqtq9jGY9yLw3hUDHWHTWI/DCbtKAzIBBC2pEOoEPdF/mFJSoQDN6bNzQaIlnOgk6GdqcViXirFt9Z1VAmzMyVeqZroCtZ2Nd11VKSKztO49AZNY+65aRe5OrKib0nJFOQMjYnScTUGbtS95qP8x8QEyGSbD1nJFO4IVQdnMqQGuX1TswG5NPkhAsUPECoH1jV2wygdQu22p/UJXumSJgZnaY9U7aHaH0xjanAgHg8PhgPNNyCZKgQMEAZwDuDkiGsbfxIIb5nfj4Z1fWgPEFQpez8wOD+z8/P+MA4OXvbtABfxNY1137HbxfmiVso1qWhZBIqr99vP94DGnaN7JOn8MVCAEhxt2OtH+o5UV5KVoogiU69ottglECVrbbja0nBZOAHsMAlGhDsNJpQ88jMEEuuirWabQHbwMfVAX9vdVvMgFKOEhKLh0pdWqNchCB1NncoCobEcjIRe/WFoFujMHROQ98QDbDYJRATi5dmybZYY934BTIIdCk5KYTkGlysarUJ38E5LyqbOgB5OVC9megeJJRkDbwQC6WyecRGJFLQyjwh6rAKEhl6PY+2282gTG5UO2ckYTSRpwvnZwHEl9o5BqlkYe+KoIiUXv9r+TutKrxYxxUDNzetZFchRLHaXzISq5rkDHo4N4YPAd8CLJvM/tg5kb21xfnfgBw6uhHl46tlneLBV3BSgqKK+BYUFiQ3AczP5AQyWxmq4LovpOwPU32LHTnyzO3APzcXGF8cPHonluVrFjCoSTqzw7/FOkAQ5CWyWN/TSWQja9euXMX+AX1NQgHnq6E3okrgcoTKEmUIJ4FuUyBzBCu/lsCI/HreycvA7gct7/5KXf/eOL3p+8550nWlSNLEp5ESWLPJCL8yZrngfuR75kLhyfurXb8Aq6UtZQC7gO4tZbF+ZufPD/4kW8b29jGQx7/AAvvTAraQIZqAAAAAElFTkSuQmCC" alt="Windows" /> Download`;
              (
                document.getElementById("btn") as HTMLButtonElement
              ).classList.remove("button-success");
            }, 3000);
            window.location.href = download;
          }}
        >
          {download === "%loading" ? "Loading..." : ""}
          {download === "%error" ? "Something went wrong..." : ""}
          {download.startsWith("https://") ? (
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAEcUlEQVRoge1Zv6sdRRg9c9+7IA9ijIohCaJvd55CxESDhVqI/4CFgq1YiYJ/goWFYBpJKdgpWIm1na1NtAjykiIgFolNYhKFFLl3v2Oxv76Z/WZ296okgfvBct/O7syc833nzMx9F9jGNrbxUIe73wDieOsin1y7lV+AXhwOWKGg8PaqkvM/vr53LX5/936AfPsqn9pZwVeoDlg5T9CL0JPwwtVjTgAhQCEIgCAWC3cWwBvxWP8bgXcOeWKxAw/XXALvHLwQnms+WpEgHQiCNUqArD+btvpqn/M1a55/ReDs1zdOyXLluXZeKB6EP3z/5LsAsNjF9e5FAnAhoBoT+zYMADcvdYR2NiLw4re3jy2Xq4LOvQCR00IUBApWfK7i+girBmEzeS4IhplmREJnHWEbEmObBM59f/NVVrwAh5eA9SOEq/UYlLW+0Gq1zVwKfCSJFuSYdHTFJhOg8Bs4HKj7cECJM9g/S4NPSGeo9Vg62eQsEsR8P3k4CYQhcImIJRn0nyGhCdLJSChFoAcvDfDmCiQkoaSsOg9BNS8FhPLS2aQC4YQB4EhO7cyiwOnEm0aNqtq9jGY9yLw3hUDHWHTWI/DCbtKAzIBBC2pEOoEPdF/mFJSoQDN6bNzQaIlnOgk6GdqcViXirFt9Z1VAmzMyVeqZroCtZ2Nd11VKSKztO49AZNY+65aRe5OrKib0nJFOQMjYnScTUGbtS95qP8x8QEyGSbD1nJFO4IVQdnMqQGuX1TswG5NPkhAsUPECoH1jV2wygdQu22p/UJXumSJgZnaY9U7aHaH0xjanAgHg8PhgPNNyCZKgQMEAZwDuDkiGsbfxIIb5nfj4Z1fWgPEFQpez8wOD+z8/P+MA4OXvbtABfxNY1137HbxfmiVso1qWhZBIqr99vP94DGnaN7JOn8MVCAEhxt2OtH+o5UV5KVoogiU69ottglECVrbbja0nBZOAHsMAlGhDsNJpQ88jMEEuuirWabQHbwMfVAX9vdVvMgFKOEhKLh0pdWqNchCB1NncoCobEcjIRe/WFoFujMHROQ98QDbDYJRATi5dmybZYY934BTIIdCk5KYTkGlysarUJ38E5LyqbOgB5OVC9megeJJRkDbwQC6WyecRGJFLQyjwh6rAKEhl6PY+2282gTG5UO2ckYTSRpwvnZwHEl9o5BqlkYe+KoIiUXv9r+TutKrxYxxUDNzetZFchRLHaXzISq5rkDHo4N4YPAd8CLJvM/tg5kb21xfnfgBw6uhHl46tlneLBV3BSgqKK+BYUFiQ3AczP5AQyWxmq4LovpOwPU32LHTnyzO3APzcXGF8cPHonluVrFjCoSTqzw7/FOkAQ5CWyWN/TSWQja9euXMX+AX1NQgHnq6E3okrgcoTKEmUIJ4FuUyBzBCu/lsCI/HreycvA7gct7/5KXf/eOL3p+8550nWlSNLEp5ESWLPJCL8yZrngfuR75kLhyfurXb8Aq6UtZQC7gO4tZbF+ZufPD/4kW8b29jGQx7/AAvvTAraQIZqAAAAAElFTkSuQmCC"
              alt="Windows"
            />
          ) : (
            <></>
          )}
          {download.startsWith("https://") ? `Download ${os.name !== "Windows" ? `(Not for ${os.name})` : os.version === "10" ? "" : `(Partially Supported for Windows ${os.version})`}` : ""}
        </button>
      </div>
    </div>
  );
}
