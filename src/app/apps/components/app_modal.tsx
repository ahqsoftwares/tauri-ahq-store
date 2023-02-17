import { useState, useEffect, useRef } from "react";

//Worker
import { BiArrowBack } from "react-icons/bi";
import Modal from "react-modal";
import fetchApps from "../../resources/api/fetchApps";

//AHQ Store Installer
import {
  isInstalled,
  updaterStatus,
} from "../../resources/api/updateInstallWorker";
import installWorker from "../../resources/classes/installWorker";

interface AppDataPropsModal {
  shown: boolean;
  change: Function;
  dark: Boolean;
  installData: any;
}

export default function ShowModal(props: AppDataPropsModal) {
  const { shown, dark, change, installData } = props;

  const [appData, setAppData] = useState<any>({
    img: "",
    title: "",
    description: "",
    author: {},
  });
  const [working, setWorking] = useState(false);
  const button = useRef<HTMLButtonElement>("" as any);
  const [installed, setInstalled] = useState(false);
  const [updating, setUpdating] = useState(true);

  useEffect(() => {
    (async () => {
      if ((installData || "") !== "") {
        setInstalled(await isInstalled(installData));
        setAppData(await fetchApps(installData));

        setUpdating(
          updaterStatus().apps?.includes(installData) === true ? true : false
        );
      }
    })();
  }, [installData]);

  const { img, title, description, author } = appData;

  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "95%",
      height: "90%",
      transition: "all 0.5s linear",
      borderRadius: "20px",
      borderColor: dark ? "rgb(30, 41, 59)" : "rgb(209, 213, 219)",
      backgroundColor: dark ? "rgb(30, 41, 59)" : "rgb(209, 213, 219)",
    },
    overlay: {
      backgroundColor: !dark
        ? "rgb(55, 65, 81, 0.5)"
        : "rgb(107, 114, 128, 0.75)",
      opacity: "1",
    },
  };
  Modal.setAppElement("body");

  return (
    <Modal isOpen={shown} contentLabel={"App Information"} style={modalStyles}>
      <div className="flex flex-col w-[100%] h-[100%]">
        <div className={`flex ${dark ? "text-slate-300" : "text-slate-800"}`}>
          <button
            onClick={() => {
              if (!working) {
                change();
              }
            }}
            className={`rounded-md p-1 ${
              !working ? (dark ? "hover:bg-gray-600" : "hover:bg-white") : ""
            }`}
            style={{ transition: "all 250ms linear" }}
          >
            <BiArrowBack size="1.5em" />
          </button>
        </div>
        <div className="flex w-[100%] h-[100%]">
          <div
            className={`w-[40%] flex flex-col items-center rounded-xl shadow-xl`}
          >
            <img src={img} alt="Logo" className="rounded-3xl shadow-2xl"></img>

            <h1
              className={`mt-5 text-3xl ${
                dark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {title}
            </h1>

            <div className="w-[95%] mt-3 mb-auto">
              <h2
                className={`text-2xl text-center ${
                  dark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {description}
              </h2>
            </div>

            {installed ? (
              <button
                ref={button}
                className="button-danger mb-4"
                disabled={updating}
                onClick={async () => {
                  setWorking(true);
                  button.current.innerHTML = "Uninstalling...";
                  await new installWorker((_) => {}).uninstall(installData);
                  button.current.innerHTML = "Uninstalled!";
                  setWorking(false);
                  setTimeout(async () => {
                    setInstalled(await isInstalled(installData));
                  }, 1000);
                }}
              >
                Uninstall
              </button>
            ) : (
              <button
                ref={button}
                className="button mb-4"
                onClick={async () => {
                  setWorking(true);
                  button.current.innerHTML = "Working...";
                  await new installWorker((event) => {
                    if (event === "downloading") {
                      button.current.innerHTML = "Downloading...";
                    } else if (event === "installing") {
                      button.current.innerHTML = "Installing...";
                    }
                  }).install([installData]);
                  button.current.innerHTML = "Installed!";
                  setWorking(false);
                  setInstalled(await isInstalled(installData));
                }}
              >
                Install
              </button>
            )}
          </div>

          <div
            className={`${
              dark ? "text-slate-200" : "text-slate-800"
            } p-4 ml-2 w-[100%] rounded-xl shadow-xl flex flex-col`}
          >
            {/*"Images (soon)"*/}
            <div></div>

            {/*Author*/}
            <div className="w-[100%]">
              <h1 className="text-xl">About Developer</h1>
              <h2 className="text-lg">{author.displayName}</h2>
            </div>

            {/*Ratings (soon)*/}
            <div></div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
