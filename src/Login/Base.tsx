import { FormEventHandler } from "react"

interface ScaffoldProps {
  title: string,
  subtitle: string,
  dark: boolean,
  onSubmit: FormEventHandler<HTMLFormElement>,
  e?: string,
  body: JSX.Element,
  button1: {
    onClick: Function,
    label: string
  },
  button2: {
    onClick: Function,
    label: string
  }
}

export default function ScaffoldLogin({ onSubmit, title, subtitle, dark, body, e, button1, button2 }: ScaffoldProps) {
  return (
    <>
      <form
        className={`mt-[5vh] modal ${dark ? "modal-d" : ""}`}
        onSubmit={(ev) => {
          ev.preventDefault();
          onSubmit(ev);
        }}
      >
        <div className="mt-[3vh]"></div>

        <h1 className="line">{title}</h1>
        <h2 className="line">{subtitle}</h2>
        <h3 className="text-2xl mt-2" style={{ color: "red" }}>{e}</h3>

        <div className="mt-auto w-[100%] flex flex-col items-center">
          {body}
        </div>

        <div className={`mt-auto w-[100%] px-3 mb-2 flex ${dark ? "text-white" : ""}`}>
          <button
            onClick={() => button1.onClick()}
            type="button"
          >
            {button1.label}
          </button>
          <div className="ml-auto"></div>
          <button
            onClick={() => button2.onClick()}
            type="button"
          >
            {button2.label}
          </button>
          <div className="mb-2"></div>
        </div>
      </form>
    </>
  )
}