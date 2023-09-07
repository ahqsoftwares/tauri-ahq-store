import type { IDefault } from "../resources/settings";

export interface IAppDataPropsModal extends IDefault {
    shown: boolean;
    change: () => void;
    installData: string;
    isAdmin: boolean;
}
export interface IAppCard extends IDefault {
    id: string;
    onClick: () => void;
}