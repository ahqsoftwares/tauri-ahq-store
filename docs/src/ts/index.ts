let element: HTMLDivElement = document.querySelector(".nav") as HTMLDivElement;

async function calculateScroll() {
  if (!element) {
    element = document.querySelector(".nav") as HTMLDivElement;
  }

  if (element) {
    window.scrollY > 70
      ? element.classList.add("nav-scrolled")
      : element.classList.remove("nav-scrolled");
  }
}

function daisyUI(dark: boolean) {
  document.querySelector("html")?.setAttribute("data-theme", dark ? "synthwave" : "light");
}

calculateScroll();

document.addEventListener("scroll", () => {
  calculateScroll();
});

const toMatch = "(prefers-color-scheme: dark)";

daisyUI(
  window.matchMedia(toMatch).matches
);

window.matchMedia(toMatch).addEventListener("change", (media) => {
  daisyUI(media.matches);
});