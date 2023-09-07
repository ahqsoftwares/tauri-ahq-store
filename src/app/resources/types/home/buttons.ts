import type { IDefault } from "../resources/settings";
import { IconType } from "react-icons";

export interface IButtonProps extends IDefault {
    Icon: IconType | string;
    title: String;
    description: String;
    no50?: boolean;
    onClick: () => void;
    calibrate?: string;
}
