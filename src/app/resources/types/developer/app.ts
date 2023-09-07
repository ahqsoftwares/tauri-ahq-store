import Toast from "../../api/toast";
import type { IDefault } from "../resources/settings";
import type { IAppDataApi } from "../resources/api";

export interface IAppInfo extends IDefault {
    appInfo: IAppDataApi;
    toast: typeof Toast;
    lastIndex: boolean;
};