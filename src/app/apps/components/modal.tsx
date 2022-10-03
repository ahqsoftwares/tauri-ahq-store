import Modal from "react-modal";

interface AppDataPropsModal {
	shown: boolean,
	change: Function,
	dark: Boolean,
	installData?: {
		img: string,
		downloadUrl: string,
		id: string
	}
}

export default function showModal(props: AppDataPropsModal) {
	const { 
		shown,
		dark,
		change
	} = props;

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
        	contentLabel={"Confirm Delete Account"}
        	style={modalStyles}
        >
            <h1 onClick={() => change()}>Hi</h1>
        </Modal>
       );
}