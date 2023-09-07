import { Auth } from "firebase/auth";
import type { IDefault } from "../resources/settings";

export interface IDevProps extends IDefault {
    auth: Auth
}