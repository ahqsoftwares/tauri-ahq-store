//Arrow
import { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import fetchApps, { cacheData } from "../../resources/api/fetchApps";
import listAllApps from "../../resources/utilities/listAllApps";
import App from "./App";

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
                           for (let i = 0; i < 100; i++) {
                                    setApps((apps) => [...apps, ...(resolvedApps as cacheData[])] as cacheData[]);
                           }
                  })();
         }, []);

         return (
         <div className="flex flex-col w-[100%] h-[100%]">
                  <div className={`flex ${dark ? "text-slate-300" : "text-slate-800"}`}>
                           <button onClick={() => change()} className={`rounded-md p-1 ${dark ? "hover:bg-gray-600" : "hover:bg-white"}`} style={{"transition": "all 250ms linear"}}>
                                    <BiArrowBack size="1.5em"/>   
                           </button>
                  </div>
                  <div className="min-h-[auto] h-[100%] min-w-[100%] pb-[1rem]" style={{"overflowY": "scroll"}}>
                           {apps.map((data) => {
                                    return <App key={data.id} appInfo={data} dark={dark} />
                           })}
                  </div>
         </div>
         );
}