import type { IDefault } from "../resources/settings";

export interface ISearchProps extends IDefault {
    query: string;
    set: React.Dispatch<React.SetStateAction<string>>;
    show: () => void;
    special?: boolean;
    isAdmin: boolean;
}