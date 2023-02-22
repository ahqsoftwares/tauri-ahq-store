import { appWindow, getAll } from "@tauri-apps/api/window";

export default function Login() {
  return (
    <div className="w-[100%] h-screen bg-gray-900">
      <button
        className="button"
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
        }}
      >
        Login
      </button>
    </div>
  );
}
