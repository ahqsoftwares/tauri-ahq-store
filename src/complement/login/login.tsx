import { unregisterAll } from "@tauri-apps/api/globalShortcut";
import { appWindow, getAll } from "@tauri-apps/api/window";
import { AiOutlineClose } from "react-icons/ai";

export default function Login() {
  return (
    <div className='w-[100vw] h-[100vh] bg-[url(bg.png)] flex flex-col p-5 transition-all rounded-2xl'>
      <button
        className="text-blue-800 p-2 hover:bg-orange-400 hover:shadow-xl rounded-md mr-auto transition-all"
        onClick={() => {
          appWindow.minimize();
          appWindow.hide();
          unregisterAll().catch(() => {});
        }}
      >
        <AiOutlineClose size={"1em"} />
      </button>
      <div className="h-[100%]"></div>
      <button
        className="button mx-auto mb-[2rem]"
        onClick={() => {
          getAll()
            .filter((window) => window.label === "main")
            .forEach((window) => {
              window.show().catch(console.log);
              window.maximize().catch(console.log);
              window.setFocus().catch(console.log);
            });
          appWindow.minimize();
          appWindow.hide();
          unregisterAll().catch(() => {});
        }}
      >
        Login
      </button>
    </div>
  );
}
