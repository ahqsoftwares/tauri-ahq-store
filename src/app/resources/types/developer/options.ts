import { IconType } from "react-icons";
import type { IDefault } from "../resources/settings";
import { MouseEventHandler } from "react";

export interface ISettingOptions extends IDefault {
    ShowCaseIcon: IconType;
    PopUp?: IconType;
    title: string;
    description: string;
    onClick: MouseEventHandler<HTMLDivElement>;
    Extra?: JSX.Element
}