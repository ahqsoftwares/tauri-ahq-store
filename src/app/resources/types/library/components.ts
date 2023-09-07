import { MouseEventHandler } from "react";
import type { IDefault } from "../resources/settings";

export interface IPropsList extends IDefault {
    change: () => void;
};

export interface IInstalledApps extends IDefault {
    onClick: MouseEventHandler<HTMLDivElement>
}