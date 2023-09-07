import { IoIosArrowForward } from "react-icons/io";

/**
 * Types
 */
import type { ISettingOptions } from "../../resources/types/developer/options";

function darkMode(classes: Array<string>, dark: boolean) {
  let newClasses: string[] = [];

  classes.forEach((c) => {
    newClasses.push(c);
    if (dark) {
      newClasses.push(c + "-dark");
    }
  });

  return newClasses.join(" ");
}

export default function SettingOption(props: ISettingOptions) {
  const { dark, title, description, ShowCaseIcon, onClick, PopUp, Extra } =
    props;

  const LinkIcon = PopUp || IoIosArrowForward;

  return (
    <div className={`${darkMode(["checkbox"], dark)} checkbox-special mt-3`}>
      <div className="checkbox-special-child" onClick={onClick}>
        <div className="ml-3"></div>

        <div
          className={`flex items-center justify-center ${
            dark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          <ShowCaseIcon size="2.5em" />
        </div>

        <div className="ml-3"></div>

        <h6>
          {title}
          <p>{description}</p>
        </h6>

        <div className="mx-auto"></div>

        <LinkIcon
          size="3em"
          className={`my-auto ml-auto mr-1 ${
            dark ? "text-slate-300" : "text-slate-700"
          }`}
        />

        <div className="mr-3"></div>
      </div>

      {Extra ? <>{Extra}</> : <></>}
    </div>
  );
}
