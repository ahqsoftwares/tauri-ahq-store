import Modal from "react-modal";

interface PasswordProps {
  shown: boolean;
  children: JSX.Element;
  width?: string;
  height?: string;
}

export default function PopUp(props: PasswordProps) {
  const { width, height, shown } = props;

  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: width || "30rem",
      minWidth: width || "30rem",
      maxWidth: width || "30rem",
      height: height || "40rem",
      maxHeight: height || "40rem",
      minHeight: height || "40rem",
      transition: "all 500ms linear",
      backgroundColor: "var(--fallback-b1,oklch(var(--b1) / 1)",
      border: "none",
    },
    overlay: {
      backgroundColor: "var(--fallback-b1,oklch(var(--b1) / 0.8)",
      opacity: "1",
      zIndex: 1000,
    },
  };
  Modal.setAppElement("body");

  return (
    <Modal isOpen={shown} style={modalStyles}>
      {props.children}
    </Modal>
  );
}
