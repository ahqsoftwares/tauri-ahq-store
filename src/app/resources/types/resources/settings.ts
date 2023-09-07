import { Auth } from "firebase/auth";
import { ChangeEventHandler, Dispatch, MouseEventHandler, SetStateAction } from "react";
import { IconType } from "react-icons/lib";

export interface IDefault {
    dark: boolean;
}

export interface IInitProps extends IDefault {
  setDark: Function;
  auth: Auth;
  setDev: Function;
  font: string;
  setFont: Function;
  autoUpdate: boolean;
  setAutoUpdate: Function;
  sidebar: string;
  setSidebar: Function;
  admin: boolean;
  theme: string;
  setTheme: Function;
}

export interface IProps extends IDefault {
    setOUO: Dispatch<SetStateAction<boolean>>;
};

interface IDefault2 {
    Icon: IconType;
    initial: string;
    onChange: ChangeEventHandler<HTMLSelectElement>
}

export interface IListSelector extends IDefault2 {
    list?: string[];
}

export interface ISidebarSelector extends IDefault, IDefault2 {}

export interface IPopUp extends IDefault {
    Icon: IconType | string;
    title: string;
    description: string;
    onClick: MouseEventHandler<HTMLDivElement>;
    roundedImage?: boolean;
}

export interface ICheckBox extends IDefault {
    url: boolean;
    disabled?: boolean;
    title: string;
    description: string;
    Icon: IconType | string;
    active: boolean;
    onClick: MouseEventHandler<HTMLDivElement>;
    noCheckbox?: boolean;
    roundedImage?: boolean;
}
