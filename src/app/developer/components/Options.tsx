import { MouseEventHandler } from "react";
import { IconType } from "react-icons";
import {IoIosArrowForward} from "react-icons/io";

function darkMode(classes: Array<string>, dark: boolean) {
         return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
}

export default function SettingOption(
         props: {
                  dark: boolean,
                  ShowCaseIcon: IconType,
                  title: string,
                  description: string,
                  onClick: MouseEventHandler<HTMLDivElement>
         }
) {
         const {
                  dark,
                  title,
                  description,
                  ShowCaseIcon,
                  onClick
         } = props;

         return (
                  <div className={`${darkMode(["checkbox"], dark)} mt-3`} onClick={onClick}>
                        <div className="ml-3"></div>            

                        <div className={`flex items-center justify-center ${dark ? "text-slate-300" : "text-slate-700"}`}>
                                <ShowCaseIcon size="2.5em" />
                        </div>
                                    
                        <div className="ml-3"></div>

                        <h6>{title}<p>{description}</p></h6>

                        <div className="mx-auto"></div>

                        <IoIosArrowForward size="3em" className={`my-auto ml-auto mr-1 ${dark ? "text-slate-300" : "text-slate-700"}`}/>
                                    
                        <div className="mr-3"></div>
                </div>
         )
}