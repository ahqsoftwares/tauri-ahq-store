import { appWindow } from "@tauri-apps/api/window";
import "./index.css";

export default function TLights({ useDef }: { useDef?: boolean }) {
  return <div className={`traffic-lights ${useDef ? "traffic-nobg" : ""}`} data-tauri-drag-region id="traffic" hidden={true}>
    <button onClick={() => appWindow.minimize()}>-</button>
    <button onClick={() => appWindow.hide()}>x</button>
  </div>;
}