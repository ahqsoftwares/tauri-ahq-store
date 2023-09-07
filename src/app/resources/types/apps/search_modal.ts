import type { IDefault } from "../resources/settings";

export interface IAppDataPropsSearchModal extends IDefault {
    shown: boolean;
    change: () => void;
    search: string;
    searchText: (text: string) => void;
}