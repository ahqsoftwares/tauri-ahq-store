import Modal from "react-modal";

interface PasswordProps {
  dark: boolean;
  shown: boolean;
  children: any;
}

export default function PopUp(props: PasswordProps) {
  const { dark, shown } = props;

  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "30rem",
      height: "40rem",
      transition: "all 500ms linear",
      borderRadius: "20px",
      borderWidth: "3px",
      borderColor: "hsl(var(--bc) / 0.9)",
      backgroundColor: "hsl(var(--b1) / 1)",
    },
    overlay: {
      backgroundColor: "hsl(var(--b1) / 0.8)",
      opacity: "1",
      zIndex: 1000,
    },
  };
  Modal.setAppElement("body");

  return (
    <Modal isOpen={shown} style={modalStyles} contentLabel={"Custom PopUp"}>
      {props.children}
    </Modal>
  );
}
