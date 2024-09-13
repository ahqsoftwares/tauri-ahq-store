import { useEffect, useState } from "react";

import {
  appData,
  AuthorObject,
  fetchAuthor,
  getResource,
} from "../../resources/api/fetchApps";

import fetchApps from "../../resources/api/fetchApps";

import { TbRosetteDiscountCheckFilled } from "react-icons/tb";

const def: appData = {
  authorId: "",
  description: "Hold tight while we load app data",
  downloadUrls: [],
  appId: "%temp%",
  repo: {
    free: () => {},
    author: "",
    repo: "",
  },
  appDisplayName: "Please Wait",
  version: "",
  appShortcutName: "",
  displayImages: [],
  install: {
    free: () => {},
    linux: undefined,
    win32: undefined,
    android: undefined,
  },
  releaseTagName: "",
  resources: [],
  app_page: "",
  license_or_tos: "",
  site: "",
  source: "",
};

export default function AppCard(props: {
  id: string;
  onClick: Function;
  dark: boolean;
}) {
  const [appData, setAppData] = useState<appData>(def);
  const [icon, setIcon] = useState<string>();
  const [author, setAuthor] = useState<AuthorObject>({
    avatar_url: "",
    free: () => {},
    github: "",
    id: "",
    name: "",
  });

  const { appDisplayName, description, source } = appData;

  useEffect(() => {
    setIcon(undefined);
    setAppData(def);
    (async () => {
      const dta = await fetchApps(props.id);

      setAppData(dta as appData);
      setAuthor(await fetchAuthor((dta as appData).authorId));

      getResource(props.id, "0")
        .then(setIcon)
        .catch((e) => {
          console.log(e);
          setIcon("/package.png");
        });
    })();
  }, [props.id]);

  return (
    <div
      className={`card bg-transparent hover:mb-2 hover:shadow-xl ${props.id ? "" : "hidden"}`}
      style={{ cursor: "pointer" }}
      onClick={
        appData.appId == "%temp%" || appData.appId == undefined
          ? () => {}
          : (props.onClick as React.MouseEventHandler<HTMLDivElement>)
      }
    >
      {icon == undefined ? (
        <div
          className={`dui-loading dui-loading-lg dui-loading-ring mt-5 mx-auto mb-[0.75rem] ${
            props.dark ? "text-white" : ""
          }`}
        />
      ) : (
        <img className="card-img" src={icon} alt="Logo"></img>
      )}

      <h1 className="card-title">{appDisplayName || "Unknown"}</h1>

      <div className="card-description">
        {(description || "Non Existent").substring(0, 64)}...
      </div>

      <div className="card-footer">
        <button
          className="text-blue-500 text-2xl flex"
          style={{ minWidth: "95%" }}
        >
          {source ||
            (appData?.authorId
              ? author.name.replace("AHQ Store (Official)", "AHQ Store")
              : "")}
          {author.name == "AHQ Store (Official)" && (
            <TbRosetteDiscountCheckFilled
              style={{
                marginTop: "auto",
                marginBottom: "auto",
                marginLeft: "3px",
              }}
              size="1em"
            />
          )}
        </button>
      </div>
    </div>
  );
}
