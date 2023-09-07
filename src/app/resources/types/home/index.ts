import { Auth } from "firebase/auth";
import React from "react"
import type { IDefault } from "../resources/settings";


export interface IHomePropsIndex extends IDefault {
    setPage: React.Dispatch<React.SetStateAction<string>>;
    auth: Auth;
    dev: boolean;
}