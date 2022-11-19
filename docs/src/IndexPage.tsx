//Index Page Elements
import DesktopIndex from "./pages/desktop";
import MobileIndex from "./pages/mobile";

export default function App({ path }: { path: string }) {
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const desktop = window.matchMedia("(min-width: 1024px)").matches;

  (document.querySelector("body") as HTMLBodyElement).classList.toggle(
    "dark",
    dark
  );

  const Page = desktop ? DesktopIndex : MobileIndex;

  return (
    <div>
      <Page dark={dark} />
    </div>
  );
}
