//Arrow
import { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import fetchApps, { cacheData } from "../../resources/api/fetchApps";
import listAllApps from "../../resources/utilities/listAllApps";

interface Props {
         dark: boolean,
         change: Function
}

export default function AppsList(props: Props) {
         const {
                  dark,
                  change
         } = props;

         const [apps, setApps] = useState<cacheData[]>([]);

         useEffect(() => {
                  (async() => {
                           const apps = await listAllApps();
                           const resolvedApps = await fetchApps(Object.keys(apps));
                           setApps(resolvedApps as cacheData[]);
                  })();
         }, []);

         console.log(apps);

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