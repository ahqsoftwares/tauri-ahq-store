interface CardProps {
  title: string,
  Icon: JSX.Element
}

export default function Card(props: CardProps) {
  const { Icon } = props;

  return (
    <div className="shadow-xl bg-base-200 hover:bg-base-300 dui-card w-[18rem]">
      <div className="dui-card-body">
        <figure className="w-[98%]">
          {Icon}
        </figure>
        <h2 className="dui-card-title">{props.title}</h2>
      </div>
    </div>
  );
}