import { useEffect, useState } from "react";
import { VscExtensions } from "react-icons/vsc";
import fetchApps from "../../resources/api/fetchApps";
import packageImg from "../../resources/package.png";

/**
 * Types
 */
import type { IAppDataApi } from "../../resources/types/api";

export default function AppCard(props: {
  id: string;
  onClick: Function;
  dark: boolean;
}) {
  const [appData, setAppData] = useState<IAppDataApi>({
    author: "",
    description: "",
    displayName: "The component is loading...",
    download: "",
    exe: "",
    icon: packageImg,
    repo: {
      author: "",
      repo: "",
    },
    title: "Loading...",
    version: "",
    id: "%temp%",
  });

  const { displayName, title, description, icon, AuthorObject } = appData;

  useEffect(() => {
    (async () => {
      const dta = await fetchApps(props.id);

      setAppData(dta as IAppDataApi);
    })();
  }, [props.id]);

  return (
    <div
      className={`card ${
        props.dark ? "hover:bg-gray-900 " : "hover:bg-gray-200 "
      }hover:mb-2 hover:shadow-xl`}
      style={{ cursor: "pointer" }}
      onClick={props.onClick as React.MouseEventHandler<HTMLDivElement>}
    >
      {title === "Loading..." ? (
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

      <h1 className="card-title">{displayName}</h1>

      <div className="card-description">{description}</div>

      <div className="card-footer">
        <button className="text-blue-500 text-2xl" style={{ minWidth: "95%" }}>
          {AuthorObject?.displayName}
        </button>
      </div>
    </div>
  );
}
