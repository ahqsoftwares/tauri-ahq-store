import { VscExtensions } from "react-icons/vsc";
import { FiExternalLink } from "react-icons/fi";

/**
 * Types
 */
import type { IInstalledApps } from "../../resources/types/library/components";

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

export default function InstalledAppsMenu(props: IInstalledApps) {
  const { dark, onClick } = props;

  return (
    <div className={`${darkMode(["checkbox"], dark)} mt-3`} onClick={onClick}>
      <div className="ml-3"></div>

      <div
        className={`flex items-center justify-center ${
          dark ? "text-slate-300" : "text-slate-700"
        }`}
      >
        <VscExtensions size="2.5em" />
      </div>

      <div className="ml-3"></div>

      <h6>
        Installed Apps<p>Show all apps installed by AHQ Store</p>
      </h6>

      <div className="mx-auto"></div>

      <FiExternalLink
        size="3em"
        className={`my-auto ml-auto mr-1 ${
          dark ? "text-slate-300" : "text-slate-700"
        }`}
      />

      <div className="mr-3"></div>
    </div>
  );
}
