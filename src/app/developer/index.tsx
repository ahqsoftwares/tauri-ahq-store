//Icons
import { useEffect, useState } from "react";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { FiExternalLink } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { RiApps2Line } from "react-icons/ri";

import { Auth } from "firebase/auth";

//Components
import Option from "./components/Options";
import Submit from "./components/Submit";
import Modal from "react-modal";
import fetchApps, { cacheData, fetchAuthor } from "../resources/api/fetchApps";
import App from "./components/App";
import Toast from "../resources/api/toast";

interface DevProps {
  auth: Auth;
  dark: boolean;
}

export default function Developers(props: DevProps) {
  const [publishedApps, setPublishedApps] = useState<cacheData[] | undefined>(
    undefined
  );

  Modal.setAppElement("body");

  const uid = props.auth?.currentUser?.uid;

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
      zIndex: 1000
    },
  };

  const { dark } = props;

  const [Icon, setIcon] = useState(true);
  const [popUp, setPopUp] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { apps } = await fetchAuthor(uid as string).then(
          (promise) => promise.data
        );

        fetchApps(apps).then((apps) => {
          console.log(apps);
          setPublishedApps(apps as cacheData[]);
        });
      } catch (e) {
        console.log(e);
        setPublishedApps([]);
      }
    })();
  }, [uid]);

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
        ShowCaseIcon={RiApps2Line}
        title={"My Apps"}
        description="View apps published by me"
        PopUp={Icon ? IoIosArrowForward : IoIosArrowDown}
        onClick={() => {
          setIcon((value) => !value);
        }}
        Extra={
          Icon ? (
            <></>
          ) : (
            <div className="flex flex-col">
              {publishedApps === undefined ? (
                <h1>Fetching...</h1>
              ) : (
                publishedApps.map((value, index) => (
                  <App
                    appInfo={value}
                    dark={props.dark}
                    reload={() => {}}
                    toast={Toast}
                    lastIndex={index === publishedApps.length - 1}
                  />
                ))
              )}
            </div>
          )
        }
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
