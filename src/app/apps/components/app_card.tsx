import { useEffect, useState } from "react";
import { VscExtensions } from "react-icons/vsc";

import { appData } from "../../resources/api/fetchApps";

import fetchApps from "../../resources/api/fetchApps";
import packageImg from "../../resources/package.png";

const def: appData = {
  authorId: "",
  description: "The component is loading...",
  downloadUrls: [],
  appId: "%temp%",
  icon: packageImg,
  repo: {
    author: "",
    repo: "",
  },
  appDisplayName: "Loading...",
  version: "",
  appShortcutName: "",
  displayImages: [],
  install: {
    linux: undefined,
    win32: undefined,
    android: undefined,
  },
  AuthorObject: {
    ahq_official: false,
    name: "",
    email: "",
    apps: [],
    icon_base64: "",
    gh_username: "",
    description: "",
    support: {
      discord: "",
      github: "",
      website: ""
    },
  },
};

export default function AppCard(props: {
  id: string;
  onClick: Function;
  dark: boolean;
}) {
  const [appData, setAppData] = useState<appData>(def);

  const { appDisplayName, description, icon, source, AuthorObject } = appData;

  useEffect(() => {
    setAppData(def);
    (async () => {
      const dta = await fetchApps(props.id);

      setAppData(dta as appData);
    })();
  }, [props.id]);

  return (
    <div
      className={`card ${
        props.dark
          ? "hover:bg-gray-900 bg-opacity-50"
          : "bg-opacity-50 hover:bg-gray-200"
      } hover:mb-2 hover:shadow-xl ${props.id ? "" : "hidden"}`}
      style={{ cursor: "pointer" }}
      onClick={
        appData.appId == "%temp%"
          ? () => {}
          : (props.onClick as React.MouseEventHandler<HTMLDivElement>)
      }
    >
      {appDisplayName === "Loading..." ? (
        <div
          className={`mx-auto mt-[1rem] mb-[0.75rem] ${
            props.dark ? "text-white" : ""
          }`}
        >
          <VscExtensions className="block" size="3em" />
        </div>
      ) : (
        <img className="card-img" src={icon} alt="Logo"></img>
      )}

      <h1 className="card-title">{appDisplayName}</h1>

      <div className="card-description">{description.substring(0, 64)}...</div>

      <div className="card-footer">
        <button className="text-blue-500 text-2xl" style={{ minWidth: "95%" }}>
          {source || AuthorObject.name}
        </button>
      </div>
    </div>
  );
}
