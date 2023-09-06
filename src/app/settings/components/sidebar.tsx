/**
 * Types
 */
import type { ISidebarSelector } from "../../resources/types/settings";

export default function SidebarSelector(props: ISidebarSelector) {
  const { Icon, initial, onChange } = props;

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
        Sidebar<p>Choose the sidebar style that suits you best!</p>
      </h6>

      <div className="mx-auto"></div>

      <select
        className="dui-select dui-select-bordered w-[15rem] max-w-xs my-auto"
        defaultValue={initial}
        onChange={onChange}
        style={{
          fontWeight: "bold",
        }}
      >
        <optgroup label="Stable">
          <option value="flex-row">Left</option>
          <option value="flex-row-reverse">Right</option>
        </optgroup>
        {initial == "flex-col" ? (
          <optgroup label="Unstable">
            <option value="flex-col">Dock {"(UnStable)"}</option>
          </optgroup>
        ) : (
          <></>
        )}
      </select>

      <div className="mr-3"></div>
    </div>
  );
}
