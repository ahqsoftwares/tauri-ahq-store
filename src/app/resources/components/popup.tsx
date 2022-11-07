import Modal from "react-modal";

interface PasswordProps {
         dark: boolean,
         shown: boolean,
         children: any
}

export default function PopUp(props: PasswordProps) {
         const {
                  dark,
                  shown
         } = props;

         const modalStyles = {
                  content: {
                           top: '50%',
                           left: '50%',
                           right: 'auto',
                           bottom: 'auto',
                           marginRight: '-50%',
                           transform: 'translate(-50%, -50%)',
                           width: "30rem",
                           height: "40rem",
                           transition: "all 500ms linear",
                           borderColor: dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
                           backgroundColor: dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
                  },
                  overlay: {
                           backgroundColor: !dark ? "rgb(55, 65, 81, 0.5)" : "rgb(107, 114, 128, 0.75)",
                           opacity: "1"
                  }
         };
         Modal.setAppElement('body');
         

         return (
                  <Modal 
                           isOpen={shown}
                           style={modalStyles}
                           contentLabel={"Custom PopUp"}
                  >
                           {props.children}
                  </Modal>
         );
}