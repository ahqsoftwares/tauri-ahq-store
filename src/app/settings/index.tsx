interface InitProps {
    dark: boolean,
    setDark: Function
}

export default function Init(props: InitProps) {

         function darkMode(classes: Array<string>, dark: boolean) {
                  return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
         }

         return (
                  
                  <div className={darkMode(["menu"], props.dark)}>
                           <div className="mt-2"></div>
                           
                           <div className={`${darkMode(["checkbox"], props.dark)}`} onClick={() => props.setDark(!props.dark)}>
                                    <div className="ml-3"></div>
                                    <h6>Dark Mode<p>Controls whether its light or dark mode.</p></h6>
                                    <div className="mx-auto"></div>
                                    <input className="slider" type={"range"} min="0" max="60" value={props.dark ? "55" : "5"} readOnly></input>
                                    <div className="mr-3"></div>
                           </div>

                           <></>
                  </div>
         )
}