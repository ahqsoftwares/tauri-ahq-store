import { appWindow } from "@tauri-apps/api/window";
import { BiArrowBack } from "react-icons/bi";

interface AppProps {
  appId: string;
}

export default function App({ appId }: AppProps) {
  console.log(appId);
  return (
    <div className="w-[100%] h-[100%] bg-orange-800">
      <button
        onClick={() => {
          appWindow.minimize();
          appWindow.hide();
        }}
      >
        <BiArrowBack />
      </button>
    </div>
  );
}
