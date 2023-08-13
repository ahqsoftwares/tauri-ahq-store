import { ChangeEventHandler } from "react";
import { IconType } from "react-icons/lib";

export default function ListSelector(props: {
  Icon: IconType;
  initial: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  list?: string[];
}) {
  const { Icon, initial, onChange, list } = props;

  return (
    <div
      className={`checkbox mt-3`}
      style={{
        cursor: "default",
      }}
    >
      <div className="ml-3"></div>

      <div className={`flex items-center justify-center`}>
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
        {!list ? (
          <>
            Font<p>Choose the font that suits you best!</p>
          </>
        ) : (
          <>
            Theme<p>Choose the UI theme of AHQ Store</p>
          </>
        )}
      </h6>

      <div className="mx-auto"></div>

      <select
        className="dui-select dui-select-bordered w-[15rem] max-w-xs my-auto"
        value={initial}
        onChange={onChange}
        style={{
          fontWeight: "bold",
        }}
      >
        {list ? (
          <>
            {list.map((item) => (
              <option key={item} value={item} style={{ fontFamily: "Segoe UI" }} data-theme={item} className="text-lg text-base-content bg-base">
                {item == "night" ? "Dark" : item[0].toUpperCase() + item.slice(1)}
              </option>
            ))}
          </>
        ) : (
          <>
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
          </>
        )}
      </select>

      <div className="mr-3"></div>
    </div>
  );
}
