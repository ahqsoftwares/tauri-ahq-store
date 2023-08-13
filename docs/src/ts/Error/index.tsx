import "../../css/err/index.css";

import {
  TbCloudSearch
} from "react-icons/tb";

import { discord, root } from "../constants";

export default function Err() {
  const data = window.location.search;

  return <div className="err-main">
    <div className="err-body">
      <TbCloudSearch />
      <h1>Oops!</h1>
      <h2>{data=="type=404" ? "The requested resource was not found" : "Something went wrong"}</h2>
    </div>
    <div className="err-footer">
      <button onClick={() => root()}>Home</button>

      <button onClick={() => discord()}>Report</button>
    </div>
  </div>;
}
