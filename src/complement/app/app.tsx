import { unregisterAll } from "@tauri-apps/api/globalShortcut";
import { appWindow } from "@tauri-apps/api/window";
import { BiArrowBack } from "react-icons/bi";

interface AppProps {
  appId: string;
}

export default function App({ appId }: AppProps) {
  console.log(appId);
  return (
    <div className="w-[100vw] h-[100vh] bg-gray-800">
      <button
        className="text-white"
        onClick={() => {
          appWindow.minimize();
          appWindow.hide();
          unregisterAll().catch(() => {});
        }}
      >
        <BiArrowBack />
      </button>
    </div>
  );
}
