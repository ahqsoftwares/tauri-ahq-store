interface SearchPropsToRender {
  img: string;
  title: string;
  description: string;
  id: string;
  set: Function;
  show: Function;
  dark: boolean;
}

export default function Load(props: SearchPropsToRender) {
  const { img, title, description, show, set, id, dark } = props;

  return (
    <div
      className="flex w-[100%] h-[3rem] shoadow-2xl rounded-xl pl-3"
      style={{ cursor: "pointer" }}
      onClick={() => {
        set(id);
        show();
      }}
    >
      <img src={img} alt="Logo" />
      <div className="ml-2">
        <h1 className={dark ? "text-white" : "text-black"}>{title}</h1>
        <h2>
          {description.length > 30
            ? `${description.substring(0, 30)}...`
            : description}
        </h2>
      </div>
    </div>
  );
}
