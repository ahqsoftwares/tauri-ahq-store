import { useState } from "react";
import Nav from "../components/SpecialNav";

export default function MainPage(
         {dark}: {dark: boolean}
) {
         const [page, setPage] = useState("home");

         return (
                  <div className="w-screen h-screen flex">
                           <Nav 
                                    dark={dark}
                                    active={page}
                                    changePage={(page: string) => {
                                             setPage(page);
                                    }}
                           />
                           <div className="w-[100%] h-screen dark:bg-gray-800">

                           </div>
                  </div>
         )
}