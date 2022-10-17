import { useEffect, useState } from "react";

export default function App(
         {
                  path
         }: 
         {
                  path: string
         }
): JSX.Element {

         const [dark, setDark] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches);

         useEffect(() => {
                  const rawDark = localStorage.getItem("dark");
                  if (rawDark !== null) {
                           const darked = JSON.parse(rawDark);
                           setDark(darked);
                  }
         }, []);


         useEffect(() => {
                  const body = document.querySelector("body") as HTMLElement;
                  body.classList[dark ? "add" : "remove"]("dark");
                  localStorage.setItem("dark", JSON.stringify(dark));
         }, [dark]);
         
         switch (path) {

         }
         return (
                  <div>
                           <button
                                    onClick={() => setDark((dark) => !dark)}
                           >Click Me to Change Something</button>
                  </div>
         );
}