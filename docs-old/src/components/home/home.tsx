import getAppInstallerFile from "../../components/api/model/fetchDownload";
import { get, set } from "../../components/api/database";

import UAParser from "ua-parser-js";
import logo from "../logo.png";

import { useEffect, useState } from "react";
import { SiWindows11 } from "react-icons/si";

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
        <img src={logo} alt="Logo" width={"125px"} draggable={false} />
        <h1
          className="text-black dark:text-white"
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
          className="block mt-auto text-slate-700 dark:text-white"
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
          className={`button flex justify-center items-center text-center text-2xl`}
          disabled={download === "%loading" || download === "%error"}
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
              "button-success",
            );
            setTimeout(() => {
              (
                document.getElementById("btn") as HTMLButtonElement
              ).innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" role="img" viewBox="0 0 24 24" class="shadow-xl" color="#32f3ff" height="1.3em" width="1.3em" xmlns="http://www.w3.org/2000/svg" style="color: rgb(50, 243, 255); border-radius: 10%; margin-right: 0.25rem;"><title></title><path d="M0,0H11.377V11.372H0ZM12.623,0H24V11.372H12.623ZM0,12.623H11.377V24H0Zm12.623,0H24V24H12.623"></path></svg><span class="text-white">Download </span>`;
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
            <>
              <SiWindows11
                className="shadow-xl"
                style={{ borderRadius: "10%", marginRight: "0.25rem" }}
                color={"#32f3ff"}
                size={"1.3em"}
              />
            </>
          ) : (
            <></>
          )}

          <span className="text-white">
            {download.startsWith("https://")
              ? `Download ${
                  os.name !== "Windows"
                    ? `(Windows 10 or above only, you are running ${os.name})`
                    : os.version === "10"
                    ? ""
                    : `(Support Dropped for Windows ${os.version})`
                }`
              : ""}
          </span>
        </button>
      </div>
    </div>
  );
}
