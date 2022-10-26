//UI Elements
import { useEffect, useState } from "react";
import { useSpring, animated } from 'react-spring'

import Nav from "./components/Nav";

export default function App(
         {
                  path
         }: 
         {
                  path: string
         }
): JSX.Element {

         const [dark, setDark] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches);

         let arr = [];
         for (let i = 0; i < 2000; i++) {
                  arr.push(i);
         }

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

         const props = useSpring({ 
                  to: { opacity: 1 }, 
                  from: { opacity: 0 },
                  reset: true,
                  delay: 3000
         });

         return (
                  <div>
                           <div>
                                    <Nav page={path}/>
                           </div>
                           <div>
                                    <animated.div style={props}>I will fade in</animated.div>
                           </div>
                  </div>
         );
}