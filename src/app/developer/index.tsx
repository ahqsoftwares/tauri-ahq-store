interface DevProps {
         dark: boolean
 }

export default function Developers(props: DevProps) {
         const {
                  dark
         } = props;

         function darkMode(classes: Array<string>, dark: boolean) {
                  return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
         }
         return (<div className={`${darkMode(["menu"], dark)}`}>
                
         </div>);
}