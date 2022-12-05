import { useEffect, useState } from "react";
import { VscExtensions } from "react-icons/vsc";
import fetchApps from "../api/fetchApps";

export default function AppCard(props: {
  id: string;
  onClick: any;
  dark: boolean;
}) {
  const [appData, setAppData] = useState<any>({
    title: "Loading...",
    description: "The current component is loading...",
    img: "",
    author: {
      displayName: "",
    },
  });

  const { title, description, img, author } = appData;

  useEffect(() => {
    (async () => {
      const dta = await fetchApps(props.id);
      setAppData(dta);
    })();
  }, [props.id]);

  return (
    <div
      className={`card ${
        props.dark ? "hover:bg-gray-900 " : "hover:bg-gray-200 "
      }hover:mb-2 hover:shadow-xl`}
      style={{ cursor: "pointer" }}
      onClick={props.onClick}
    >
      {title === "Loading..." ? (
        <div className="mx-auto mt-[1rem] mb-[0.75rem]">
          <VscExtensions className="block" size="3em" />
        </div>
      ) : (
        <img className="card-img" src={img} alt="Logo"></img>
      )}

      <h1 className="card-title">{title}</h1>

      <div className="card-description">{description}</div>

      <div className="card-footer">
        <button className="text-blue-500 text-2xl" style={{ minWidth: "95%" }}>
          {author.displayName}
        </button>
      </div>
    </div>
  );
}
