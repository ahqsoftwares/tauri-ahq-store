import { ChangeEventHandler } from "react";
import { IconType } from "react-icons/lib";

export default function FontSelector(props: {
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
        Font<p>Choose the font that suits you best!</p>
      </h6>

      <div className="mx-auto"></div>

      <select
        className={`select ${props.dark ? "select-d text-blue-700" : "text-red-700"}`}
        defaultValue={initial}
        onChange={onChange}
        style={{
          fontWeight: "bold"
        }}
      >
        <optgroup label="Store Style">
          <option value="def" style={{ fontFamily: "Segoe UI" }}>
            Normal
          </option>
          <option value="def-v" style={{ fontFamily: "Roboto" }}>
            Pro
          </option>
        </optgroup>
        <optgroup label="Store+">
          <option value="ari" style={{ fontFamily: "Arial" }}>
            Arial
          </option>
          <option value="ext" style={{ fontFamily: "Extatica" }}>
            Extatica
          </option>
          <option value="bhn" style={{ fontFamily: "Bahnschrift" }}>
            Bahnschrift
          </option>
        </optgroup>
        <optgroup label="Formal">
          <option value="tnr" style={{ fontFamily: "Times New Roman" }}>
            Times New Roman
          </option>
          <option value="geo" style={{ fontFamily: "Georgia" }}>
            Georgia
          </option>
          <option value="gra" style={{ fontFamily: "Garamond" }}>
            Garamond
          </option>
        </optgroup>
      </select>

      <div className="mr-3"></div>
    </div>
  );
}
