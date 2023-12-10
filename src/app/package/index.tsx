import Card from "./components/Card";

import { TbAppWindow } from "react-icons/tb";
import { FaNodeJs } from "react-icons/fa";
import { MdError, MdWarning } from "react-icons/md";

import vsc from "./vsc.svg";

function Vsc() {
  return <img className="3rem" src={vsc} />;
}

export default function Package() {
  return (
    <div className="menu">
      <div role="alert" className="w-[98%] dui-alert dui-alert-warning mt-2">
        <MdWarning size={"1.5rem"} />
        <span>The required components will be automatically installed when an app needs them</span>
      </div>

      <div role="alert" className="w-[98%] dui-alert dui-alert-error mt-2">
        <MdError size={"1.5rem"} />
        <span>Uninstalling any of the below ones might break apps or even your os</span>
      </div>

      <div className="px-2 py-5 w-[98%] grid gap-3 grid-cols-3">
        <Card
          title="Framework (Not Ready)"
          body="Required by apps that run via the framework made by the AHQ Store Developers"
          Icon={TbAppWindow}
          installed={false}
        />

        <Card
          title="Dev Camp (Not Ready)"
          body="Develop AHQ Store apps!"
          Icon={TbAppWindow}
          installed={false}
        />

        <Card
          title="VC Redist"
          body="Microsoft Visual Studio Redistributable for C++"
          Icon={Vsc}
          installed={false}
          cannotRemove={true}
        />

        <Card
          title="NodeJS 21"
          body="NodeJS version 21 (v21.4.0)"
          Icon={() => <FaNodeJs size={"3rem"} color={"#8fc84c"} />}
          installed={false}
        />

        <Card
          title="NodeJS LTS"
          body="NodeJS version 20 LTS (v20.10.0)"
          Icon={() => <FaNodeJs size={"3rem"} color={"#8fc84c"} />}
          installed={false}
        />
      </div>
    </div>
  );
}