import { MouseEventHandler } from "react";
import { IconType } from "react-icons/lib";

export default function CheckBox(
         props: {
                  dark: boolean,
                  disabled?: boolean,
                  title: string,
                  description: string,
                  Icon: IconType | string,
                  active: boolean,
                  onClick: MouseEventHandler<HTMLDivElement>
         }
) {
         const {
                  Icon
         } = props;

         function darkMode(classes: Array<string>, dark: boolean) {
                  return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
         }

         return (
                  <div className={`${darkMode(["checkbox"], props.dark)} mt-3`} onClick={props.onClick}>
                           <div className="ml-3"></div>
                                    
                           <div className={`flex items-center justify-center ${props.dark ? "text-slate-300" : "text-slate-700"}`}>
                                    {typeof(Icon) !== "string" ?
                                             <Icon size="2.5em"/>
                                             :
                                             <img src={Icon} alt="Icon" style={{"minHeight": "2.5em", "minWidth": "2.5em"}} />
                                    }
                           </div>
                                    
                           <div className="ml-3"></div>

                           <h6>{props.title}<p className={`${props.disabled ? props.dark ? "text-red-700" : "text-red-500" : ""}`}>{props.description}</p></h6>

                           <div className="mx-auto"></div>

                           <input className={props.active ? "slider" : "slider slider-disabled"} type={"range"} min="0" max="60" value={props.active ? "55" : "5"} readOnly></input>
                                    
                           <div className="mr-3"></div>
                  </div>
         )
}