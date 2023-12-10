import { IconBaseProps, IconType } from "react-icons";
import "./card.css"

interface CardProps {
  title: string,
  body?: string,
  installed: boolean,
  cannotRemove?: boolean,
  Icon: IconType | ((props: IconBaseProps) => JSX.Element)
}

export default function Card(props: CardProps) {
  const { Icon, installed, cannotRemove } = props;

  return (
    <div className="p-card">
      <div className="pc-body">
        <figure>
          <Icon size={"3em"} />
        </figure>

        <h1>{props.title}</h1>
        <h2>{props.body || "<-- OPTIONAL COMPONENT -->"}</h2>

        <div>
          <button className={`dui-btn ${installed ? "dui-btn-error" : "dui-btn-primary"}`} disabled={cannotRemove}>{installed ? "Uninstall" : "Install"}</button>
        </div>
      </div>
    </div>
  );
}