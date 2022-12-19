import "./apps.css";
import * as workerManager from "../worker/index";

export default function AppsLayout() {
  workerManager.fetchApps().then(console.log);
  return <></>;
}
