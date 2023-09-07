import type { IPrefs } from "../app";
import type { IDefault } from "./settings";

interface IAppDataExtension {
    theme: string;
    debug: boolean;
}

interface IAPPDataExtension2 extends IDefault {
    font: string;
    autoUpdate: boolean;
    sidebar: string;
    accessPrefs?: IPrefs;
    isAdmin?: boolean;
}

export interface IAppData extends IAppDataExtension, IAPPDataExtension2 {}
export interface IAppDataNoExtension extends IAPPDataExtension2 {}

export interface IApps {
    [key: string]: string;
};

export interface IBetaPrefs {
    enableSearchOnEnter: boolean;
}