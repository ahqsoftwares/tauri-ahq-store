import { FcHome, FcSettings } from "react-icons/fc";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Auth } from "../auth";
import { apps, user, library, plugins, dev } from "./icons";

interface prop {
  active: string;
  home: Function;
  auth: Auth;
}

export default function Nav(props: prop) {
  let { active, auth, home: changePage } = props;

  getCurrentWebviewWindow().setTitle(
    `${active.replace("user", "account")[0].toUpperCase()}${active
      .replace("user", "ccount")
      .replace(active[0], "")
      .toLowerCase()} - AHQ Store`,
  );

  const Button = ({
    text,
    img,
    on,
    id,
  }: {
    id?: string;
    text: string;
    on: string;
    img: JSX.Element;
  }) => (
    <button
      className={`flex w-[98%] px-3 py-2 dui-btn dui-btn-ghost ${active == on ? "nav-selected-line" : ""} no-animation mt-1 transition-all`}
      id={id}
      onClick={() => changePage(on)}
    >
      <div className="w-[5px] h-[5%] my-auto rounded-xl line" />
      {img}
      <span className="block text-lg mr-auto">{text}</span>
    </button>
  );

  return (
    <div
      className={`w-[12rem] h-[98vh] my-auto ml-2 px-2 rounded-lg flex flex-col items-center nav`}
      id={"sidebar"}
    >
      <Button img={<FcHome size="1.5em" />} text="Home" on="home" />

      <Button
        img={<img style={{ width: "1.5em", height: "1.5em" }} src={apps} />}
        text="Apps"
        on="apps"
      />

      {/* <Button
        text="Plugins"
        img={<img style={{ width: "1.5em", height: "1.5em" }} src={plugins} />}
        on="Dependencies"
      /> */}

      <div className={"mt-auto mb-auto"}></div>

      {auth.currentUser?.dev && (
        <Button
          text="Developer"
          img={<img style={{ width: "1.5em", height: "1.5em" }} className="rotate-[40deg]" src={dev} />}
          on="developer"
        />
      )}

      <Button
        text="Library"
        img={<img style={{ width: "1.5em", height: "1.5em" }} src={library} />}
        on="library"
      />

      <Button
        text="Account"
        img={
          <img
            className="rounded-full"
            style={{ width: "1.5em" }}
            src={auth.currentUser?.avatar_url || user}
          />
        }
        on="user"
      />

      <Button
        text="Settings"
        img={<FcSettings size="1.5em" />}
        on="settings"
        id="settings"
      />
      <div className="mb-1"></div>
    </div>
  );
}
