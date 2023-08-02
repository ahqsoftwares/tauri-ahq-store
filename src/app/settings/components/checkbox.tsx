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

  function darkMode(classes: Array<string>, dark: boolean) {
    return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
  }

  return (
    <div
      className={`${darkMode(["checkbox"], props.dark)} mt-3`}
      onClick={props.onClick}
    >
      <div className="ml-3"></div>

      <div
        className={`flex items-center justify-center ${
          props.dark ? "text-slate-300" : "text-slate-700"
        }`}
      >
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
