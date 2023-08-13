export default async function Resolve(): Promise<JSX.Element> {
   const page = document.location.pathname.toLowerCase();

   if (page == "/") {
      return (await import("../ts/Home/index.tsx")).default();
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

   window.location.href = `${window.location.origin}/error?type=404`
   return (await import("../ts/Error/index.tsx")).default();
}