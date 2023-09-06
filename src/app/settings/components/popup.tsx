import { FiExternalLink } from "react-icons/fi";

/**
 * Types
 */
import type { IPopUp } from "../../resources/types/settings";

export default function PopUp(props: IPopUp) {
  const { Icon, roundedImage } = props;

  return (
    <div className={`checkbox mt-3`} onClick={props.onClick}>
      <div className="ml-3"></div>

      <div className={`flex items-center justify-center text-base-content`}>
        {typeof Icon !== "string" ? (
          <Icon
            size="2.5em"
            style={{ borderRadius: roundedImage ? "20%" : 0 }}
          />
        ) : (
          <img
            src={Icon}
            alt="Icon"
            style={{
              minHeight: "2.5em",
              minWidth: "2.5em",
              maxHeight: "2.5em",
              maxWidth: "2.5em",
              borderRadius: roundedImage ? "20%" : 0,
            }}
          />
        )}
      </div>

      <div className="ml-3"></div>

      <h6>
        {props.title}
        <p>{props.description}</p>
      </h6>

      <div className="mx-auto"></div>

      <FiExternalLink
        color={props.dark ? "white" : "black"}
        size="2.5em"
        className="my-auto"
      />

      <div className="mr-3"></div>
    </div>
  );
}
