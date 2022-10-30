
//Icons
import {AiOutlineAppstoreAdd} from "react-icons/ai";
import { VscExtensions } from "react-icons/vsc";

//Components
import Option from "./components/Options";

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
                <Option 
                        dark={dark} 
                        ShowCaseIcon={VscExtensions} 
                        title={"My Apps"} 
                        description="View apps published by me (soon)"
                        onClick={() => {
                                
                        }}
                />
                <Option 
                        dark={dark} 
                        ShowCaseIcon={AiOutlineAppstoreAdd} 
                        title={"Add"} 
                        description="Submit a new app to the store (soon)"
                        onClick={() => {
                                
                        }}
                />
        
        </div>);
}