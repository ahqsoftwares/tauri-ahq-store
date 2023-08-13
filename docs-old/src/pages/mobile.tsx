import { useEffect } from "react";
import { useState } from "react";
import getAppInstallerFile from "../components/api/model/fetchDownload";
import logo from "../components/logo.png";

export default function MobileIndex({ dark }: { dark: boolean }) {
  const [download, setDownload] = useState("%loading");
  const [version, setV] = useState("0.0.0");

  useEffect(() => {
    (async () => {
      getAppInstallerFile()
        .then(({ tagName, download_url }) => {
          setDownload(download_url);
          setV(tagName);
        })
        .catch(() => {
          setDownload("%error");
        });
    })();
  }, []);

  return (
    <div
      className={`absolute h-screen w-screen flex justify-center items-center text-center ${
        dark ? "bg-gray-900" : "bg-white"
      }`}
    >
      <div
        className={`w-[95%] h-[80%] ${
          dark ? "bg-gray-800" : "bg-gray-300"
        } rounded-xl shadow-md py-2 flex flex-col justify-center items-center text-center`}
        style={{
          overflow: "scroll",
        }}
      >
        <div className="flex flex-col justify-center text-center items-center">
          <img
            className="mt-[3rem]"
            src={logo}
            alt={"AHQ Store Logo"}
            width={"100px"}
          />
          <h1
            className={`block mt-auto ${
              dark ? "text-blue-700" : "text-blue-900"
            }`}
            style={{
              fontSize: "3rem",
              fontWeight: "bolder",
            }}
          >
            AHQ Store
          </h1>
          <span className={`text-red-700 font-extrabold text-2xl sm:text-3xl`}>
            {version !== "0.0.0" ? ` v${version}` : ""}
          </span>
        </div>
        <div className="my-auto w-[100%] flex flex-col items-center">
          <button
            className="button flex justify-center text-center items-center"
            style={{
              minWidth: "80%",
              maxWidth: "80%",
              minHeight: "3.5rem",
              maxHeight: "3.5rem",
            }}
            onClick={() => {
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
            {download.startsWith("https://") ? "Download (Exe)" : ""}
          </button>
        </div>
        <button
          className="block button button-success mb-5"
          style={{
            minWidth: "80%",
            maxWidth: "80%",
          }}
        >
          Docs (Coming soon for phones)
        </button>
      </div>
    </div>
  );
}
