import type { IPrefs } from "./app";

interface IAppDataExtension {
    theme: string;
    debug: boolean;
}

interface IAPPDataExtension2 {
    dark: boolean;
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