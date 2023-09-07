import { FiExternalLink } from "react-icons/fi";

/**
 * types
 */
import type { ICheckBox } from "../../resources/types/resources/settings";

export default function CheckBox(props: ICheckBox) {
  const { Icon, noCheckbox, roundedImage, url } = props;

  return (
    <div className={`checkbox mt-3`} onClick={props.onClick}>
      <div className="ml-3"></div>

      <div className={`flex items-center justify-center text-base-content`}>
        {typeof Icon !== "string" ? (
          <Icon size="2.5em" />
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
        <p
          className={`${
            props.disabled ? (props.dark ? "text-red-700" : "text-red-500") : ""
          }`}
        >
          {props.description}
        </p>
      </h6>

      <div className="mx-auto"></div>

      {noCheckbox ? (
        <>
          {url ? (
            <FiExternalLink
              size="2.5em"
              className="my-auto"
              color={props.dark ? "white" : "black"}
            />
          ) : (
            <></>
          )}
        </>
      ) : (
        <input
          className={`dui-toggle dui-toggle-lg dui-toggle-success my-auto`}
          type="checkbox"
          checked={props.active}
          readOnly
        />
      )}

      <div className="mr-3"></div>
    </div>
  );
}
