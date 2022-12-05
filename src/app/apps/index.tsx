/*
React Native
*/
import { useState, useEffect } from "react";
import { Auth } from "firebase/auth";

/*
Functions
*/
import Search from "./functions/search";

/*
Components
*/
import Layer from "./components/layer";
import Card from "../resources/components/app_card";
import Modal from "./components/modal";

/*
StyleSheets
*/
import "./index.css";

/*
Interfaces
*/
interface AppsProps {
  dark: boolean;
  auth: Auth;
  apps: Array<any>;
  allAppsData: {
    map: {
      [key: string]: any;
    };
  };
}

function darkMode(classes: Array<string>, dark: boolean) {
  return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
}

export default function Apps(props: AppsProps) {
  const { dark, apps, allAppsData } = props;

  const [shown, showModal] = useState(false),
    [search, searchText] = useState(""),
    [enter, setEnter] = useState(false),
    [data, setData] = useState("");

  useEffect(() => {
    function Fix() {
      const element = document.querySelector("#search-result") as any;
      element.style = `width: ${
        document.querySelector("#get-width")?.clientWidth
      }px;`;
    }
    window.addEventListener("resize", () => {
      Fix();
    });
    Fix();
  }, []);

  function change() {
    showModal(!shown);
  }

  let key = 0;
  function keyGen() {
    key += 1;
    return key;
  }

  return (
    <div className={darkMode(["menu"], dark)}>
      <Modal shown={shown} dark={dark} change={change} installData={data} />
      <div
        className="w-[40%] mt-2"
        onBlur={() => {
          setTimeout(() => {
            if (!enter) {
              searchText("");
            }
          }, 100);
        }}
      >
        <input
          className={`search-input ${dark ? "style-input-d" : ""}`}
          placeholder={`🔎 Search for an app`}
          value={search}
          onChange={(e) => {
            searchText(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              setEnter(true);
            } else {
              setEnter(false);
            }
          }}
          autoComplete={"off"}
          id="get-width"
        ></input>
        <div
          className={`absolute ${
            !dark ? "bg-gray-200 text-black" : "bg-gray-500 text-white"
          } rounded-b-xl`}
          id="search-result"
        >
          {search.length > 0 && !enter ? (
            <Search
              {...allAppsData}
              query={search}
              set={setData}
              show={change}
            />
          ) : (
            <></>
          )}
        </div>
      </div>

      <div className="appss">
        {apps.length === 0 ? (
          <>
            <h1 className="apps-text">Loading Your Apps...</h1>
          </>
        ) : (
          <></>
        )}

        {apps.map((filess: any) => {
          try {
            const [alt, data] = filess;
            const apps: any = data;
            return (
              <Layer alt={alt as string} key={keyGen()}>
                {apps.map((data: string) => {
                  try {
                    return (
                      <Card
                        key={keyGen()}
                        id={data}
                        onClick={() => {
                          setData(data);
                          change();
                        }}
                        dark={dark}
                      />
                    );
                  } catch (e) {
                    return <div key={keyGen()}></div>;
                  }
                })}
              </Layer>
            );
          } catch (e) {
            return <div key={keyGen()}></div>;
          }
        })}
      </div>
    </div>
  );
}
