import { MouseEventHandler } from "react";
import { FiExternalLink } from "react-icons/fi";
import { IconType } from "react-icons/lib";

export default function CheckBox(props: {
  dark: boolean;
  url: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  Icon: IconType | string;
  active: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
  noCheckbox?: boolean;
  roundedImage?: boolean;
}) {
  const { Icon, noCheckbox, roundedImage, url } = props;

  return (
    <div className={`checkbox mt-3`} onClick={props.onClick} style={{ "cursor": noCheckbox && !url ? "default" : "pointer" }}>
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
        <span className="flex">
          {props.title}
          {url && <FiExternalLink
            size="1em"
            className="ml-1 my-auto"
            color={props.dark ? "white" : "black"}
          />}
        </span>
        <p
          className={
            props.disabled ? (props.dark ? "text-red-700" : "text-red-500") : ""
          }
        >
          {props.description}
        </p>
      </h6>

      <div className="mx-auto"></div>

      {!noCheckbox && (
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
