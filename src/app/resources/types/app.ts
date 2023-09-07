import { Auth } from "firebase/auth";
import type { IDefault } from "./resources/settings";

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

export interface appData extends IDefault {
  theme: string;
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