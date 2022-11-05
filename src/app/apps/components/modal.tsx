import { useState, useEffect } from "react";
import { BiArrowBack } from "react-icons/bi";
import Modal from "react-modal";
import fetchApps from "../../resources/api/fetchApps";

interface AppDataPropsModal {
	shown: boolean,
	change: Function,
	dark: Boolean,
	installData: any
}

export default function ShowModal(props: AppDataPropsModal) {
	const { 
		shown,
		dark,
		change,
        installData
	} = props;

    const [appData, setAppData] = useState<any>({
        img: "",
        title: "",
        description: "",
        author: {}
    });

    useEffect(() => {
        (async() => {
            setAppData(await fetchApps(installData));
        })()
    }, [installData]);

    const {
        img,
        title,
        description,
        author
    } = appData;

	const modalStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: "95%",
            height: "90%",
            transition: "all 500ms linear",
            borderRadius: "20px",
            borderColor: dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
            backgroundColor: dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
        },
        overlay: {
        	backgroundColor: !dark ? "rgb(55, 65, 81, 0.5)" : "rgb(107, 114, 128, 0.75)",
        	opacity: "1"
        }
    };
    Modal.setAppElement('#root');

	return (
		<Modal
        	isOpen={shown}
        	contentLabel={"App Information"}
        	style={modalStyles}
        >
            <div className="flex flex-col w-[100%] h-[100%]">
                <div className={`flex ${dark ? "text-slate-300" : "text-slate-800"}`}>
                    <button onClick={() => change()} className={`rounded-md p-1 ${dark ? "hover:bg-gray-600" : "hover:bg-white"}`} style={{"transition": "all 250ms linear"}}>
                        <BiArrowBack size="1.5em"/>
                    </button>
                </div>
                <div className="flex w-[100%] h-[100%]">
                    <div className={`w-[40%] flex flex-col items-center rounded-xl shadow-xl`}>
                        <img src={img} alt="Logo" className="rounded-3xl shadow-2xl"></img>
                        
                        <h1 className={`mt-5 text-3xl ${dark ? "text-slate-200" : "text-slate-800"}`}>{title}</h1>
                        
                        <div className="w-[95%] mt-3 mb-auto">
                            <h2 className={`text-2xl text-center ${dark ? "text-gray-400" : "text-gray-600"}`}>{description}</h2>
                        </div>

                        <button disabled className="button mb-4">Install</button>
                    </div>

                    <div className={`${dark ? "text-slate-200" : "text-slate-800"} p-4 ml-2 w-[100%] rounded-xl shadow-xl flex flex-col`}>
                        {/*"Images (soon)"*/}
                        <div>

                        </div>

                        {/*Author*/}
                        <div className="w-[100%]">
                            <h1 className="text-xl">About Developer</h1>
                            <h2 className="text-lg">{author.displayName}</h2>
                        </div>

                        {/*Ratings (soon)*/}
                        <div>

                        </div>
                    </div>
                </div>
            </div>
        </Modal>
       );
}