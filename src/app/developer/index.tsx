//Icons
import { useState } from "react";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { FiExternalLink } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { VscExtensions } from "react-icons/vsc";

//Components
import Option from "./components/Options";

interface DevProps {
  dark: boolean;
}

export default function Developers(props: DevProps) {
  const { dark } = props;

  const [Icon, setIcon] = useState(true);

  function darkMode(classes: Array<string>, dark: boolean) {
    return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
  }
  return (
    <div className={`${darkMode(["menu"], dark)}`}>
      <Option
        dark={dark}
        ShowCaseIcon={VscExtensions}
        title={"My Apps"}
        description="View apps published by me (soon)"
        PopUp={Icon ? IoIosArrowForward : IoIosArrowDown}
        onClick={() => {
          setIcon((value) => !value);
        }}
        Extra={Icon ? <></> : <h1>Hi</h1>}
      />
      <Option
        dark={dark}
        ShowCaseIcon={AiOutlineAppstoreAdd}
        title={"Add"}
        description="Submit a new app to the store (soon)"
        onClick={() => {}}
        PopUp={FiExternalLink}
      />
    </div>
  );
}
