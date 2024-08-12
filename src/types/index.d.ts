export {};

declare module '*.svg' {
  const content: string;
  export default content;
}
declare module '*.svg?react' {
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

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
      version: "10" | "11" | "lin";
    };
    map: { [key: string]: Object };
  }
}
