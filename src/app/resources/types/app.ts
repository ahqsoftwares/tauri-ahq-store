import { Auth } from "firebase/auth";

declare global {
  interface Window {
    prefs: IWindowPrefs;
  }
}

export interface IAppProps {
    data: {
      auth: Auth;
    };
  }

export interface appData {
  theme: string;
  dark: boolean;
  font: string;
  autoUpdate: boolean;
  sidebar: string;
  debug: boolean;
  accessPrefs?: IPrefs;
  isAdmin?: boolean;
}

export interface IPrefs {
  launch_app: boolean;
  install_apps: boolean;
}

interface IWindowPrefs extends appData {
  accessPrefs: IPrefs;
};

export interface IProp {
  active: string;
  home: Function;
  dev: boolean | undefined;
  horizontal: boolean;
}