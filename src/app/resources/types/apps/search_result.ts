import type { IDefault } from "../resources/settings";
import React from "react";

export interface ISearchPropsToRender extends IDefault {
    icon: string;
    displayName: string;
    description: string;
    id: string;
    set: React.Dispatch<React.SetStateAction<string>>;
    show: () => void;
    isAdmin: boolean;
}