import { appWindow } from "@tauri-apps/api/window";
import "./index.css";
import { useEffect, useState } from "react";

export default function TLights({ useDef }: { useDef?: boolean }) {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    const status = setInterval(() => {
      appWindow.isMaximized().then(setMaximized);
    }, 30);

    return () => clearInterval(status);
  }, []);

  return <div className={`traffic-lights ${useDef ? "traffic-nobg" : ""}`} data-tauri-drag-region>
    <button onClick={() => appWindow.minimize()}>-</button>
    <button onClick={() => appWindow.toggleMaximize()}></button>
    <button onClick={() => appWindow.hide()}>x</button>
  </div>;
}