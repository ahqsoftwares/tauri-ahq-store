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

calculateScroll();

document.addEventListener("scroll", () => {
  calculateScroll();
});
