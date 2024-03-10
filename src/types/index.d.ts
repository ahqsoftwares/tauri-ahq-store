export {};

declare global {
  interface Window {
    prefs: {
      accessPrefs: {
        launch_app: boolean;
        install_apps: boolean;
      };
    };
    os: {
      type: "windows" | "linux";
      version: "10" | "11" | "7" | "lin";
    };
  }
}
