//Arrow
import { BiArrowBack } from "react-icons/bi";

interface Props {
         dark: boolean,
         change: Function
}

export default function allAppsList(props: Props) {
         const {
                  dark,
                  change
         } = props;

         return (
         <div className="flex flex-col w-[100%] h-[100%]">
                  <div className={`flex ${dark ? "text-slate-300" : "text-slate-800"}`}>
                           <button onClick={() => change()} className={`rounded-md p-1 ${dark ? "hover:bg-gray-600" : "hover:bg-white"}`} style={{"transition": "all 250ms linear"}}>
                                    <BiArrowBack size="1.5em"/>   
                           </button>
                  </div>
         </div>
         );
}