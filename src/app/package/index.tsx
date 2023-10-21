import Card from "./components/Card";

import { TbAppWindow } from "react-icons/tb";

export default function Package() {
  return (
    <div className="menu">
      <div className="px-2 py-5 w-[100%] grid">
        <Card
          title="Framework"
          Icon={<TbAppWindow size={"20em"} />}
        />
      </div>
    </div>
  );
}