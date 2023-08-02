import Error from "../ts/Error/index.tsx";

export default async function Resolve(): Promise<JSX.Element> {
  const page = document.location.pathname.toLowerCase();

  if (page == "/") {
    document.location.pathname = "/home";
  }
  if (page == "/about") {
    return (await import("../ts/About/index.tsx")).default();
  }
  if (page == "/docs") {
    return (await import("../ts/Docs/index.tsx")).default();
  }
  if (page == "/error") {
    return (await import("../ts/Error/index.tsx")).default();
  }
  if (page == "/home") {
    return (await import("../ts/Home/index.tsx")).default();
  }
  return Error();
}
