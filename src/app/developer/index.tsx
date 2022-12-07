//Icons
import { useState } from "react";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { FiExternalLink } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { VscExtensions } from "react-icons/vsc";

//Components
import Option from "./components/Options";
import Submit from "./components/Submit";
import Modal from "react-modal";

interface DevProps {
  dark: boolean;
}

export default function Developers(props: DevProps) {
  Modal.setAppElement("body");

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "98%",
      height: "98%",
      transition: "all 500ms linear",
      backgroundColor: props.dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
      borderColor: props.dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
    },
    overlay: {
      backgroundColor: !props.dark
        ? "rgb(55, 65, 81, 0.5)"
        : "rgb(107, 114, 128, 0.75)",
    },
  };

  const { dark } = props;

  const [Icon, setIcon] = useState(true);
  const [popUp, setPopUp] = useState(false);

  function darkMode(classes: Array<string>, dark: boolean) {
    return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
  }
  return (
    <div className={`${darkMode(["menu"], dark)}`}>
      <Modal style={customStyles} isOpen={popUp}>
        <Submit
          toggle={() => {
            setPopUp(false);
          }}
          dark={dark}
        />
      </Modal>
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
        onClick={() => {
          setPopUp((value) => !value);
        }}
        PopUp={FiExternalLink}
      />
    </div>
  );
}
