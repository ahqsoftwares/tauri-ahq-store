import { Auth } from "firebase/auth";
import type { IDefault } from "../resources/settings";

export interface IAppsPropsIndex extends IDefault {
    auth: Auth;
    apps: Array<IAppsArrayData>;
    isAdmin: boolean;
}

interface IAppsArrayData {
    alt: string;
    data: Array<string>
}