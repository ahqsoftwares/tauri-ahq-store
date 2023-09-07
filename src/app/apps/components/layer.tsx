export default function Splitter(props: {
  children: JSX.Element[];
  alt: string;
}) {
  return (
    <div className="layer mx-[0.5rem]">
      <h1 className="title">{props.alt}</h1>
      <div className="item">{props.children}</div>
    </div>
  );
}
