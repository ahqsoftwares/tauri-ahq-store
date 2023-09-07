export {};

declare global {
  interface Window {
    prefs: {
      accessPrefs: {
        launch_app: boolean;
        install_apps: boolean;
      };
    };
  }
}
