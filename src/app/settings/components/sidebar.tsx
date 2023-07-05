import { ChangeEventHandler } from "react";
import { IconType } from "react-icons/lib";

export default function SidebarSelector(props: {
  Icon: IconType;
  dark: boolean;
  initial: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
}) {
  const { Icon, initial, onChange } = props;

  function darkMode(classes: Array<string>, dark: boolean) {
    return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
  }

  return (
    <div
      className={`${darkMode(["checkbox"], props.dark)} mt-3`}
      style={{
        cursor: "default",
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
            style={{ minHeight: "2.5em", minWidth: "2.5em" }}
          />
        )}
      </div>

      <div className="ml-3"></div>

      <h6 style={{ cursor: "default" }}>
        Sidebar<p>Choose the sidebar style that suits you best!</p>
      </h6>

      <div className="mx-auto"></div>

      <select
        className={`select ${
          props.dark ? "select-d text-gray-300" : "text-red-700"
        }`}
        defaultValue={initial}
        onChange={onChange}
        style={{
          fontWeight: "bold",
        }}
      >
        <optgroup label="General">
          <option value="flex-row">Left</option>
          <option value="flex-row-reverse">Right</option>
          <option value="flex-col">Dock {"(UnStable)"}</option>
        </optgroup>
      </select>

      <div className="mr-3"></div>
    </div>
  );
}
