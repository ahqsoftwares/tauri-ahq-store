import { IconType } from "react-icons/lib";

export default function InfoBox(props: {
  dark: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  Icon: IconType | string;
  rounded?: boolean;
  url: string;
}) {
  const { Icon, rounded, url } = props;

  function darkMode(classes: Array<string>, dark: boolean) {
    return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
  }

  return (
    <div
      className={`${darkMode(["checkbox"], props.dark)} mt-3`}
      onClick={() => {
        window.open(url, "_blank");
      }}
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
            }}
            className={rounded ? "rounded-[15%]" : ""}
          />
        )}
      </div>

      <div className="ml-3"></div>

      <h6>
        <span className={props.dark ? "text-gray-100" : "text-gray-900"}>
          {props.title}
        </span>
        <p
          className={`${
            props.disabled ? (props.dark ? "text-red-700" : "text-red-500") : ""
          }`}
        >
          {props.description}
        </p>
      </h6>

      <div className="mx-auto"></div>

      <div className="mr-3"></div>
    </div>
  );
}
