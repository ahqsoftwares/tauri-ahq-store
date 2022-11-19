const toastElement = document.getElementById("toast") as HTMLDivElement;

export default function Toast(
  text: string,
  type: "success" | "warn" | "danger",
  expireAfter: number | "never"
) {
  const toast = document.createElement("div");
  toast.setAttribute("class", `toast toast-${type}`);
  toast.innerHTML = `<h1>${text}</h1>`;

  const elementToRemove = toastElement.appendChild(toast);

  if (expireAfter !== "never") {
    setTimeout(() => {
      elementToRemove.setAttribute("hidden", "true");
      setTimeout(() => {
        toastElement.removeChild(elementToRemove);
      }, (expireAfter as number) + 1000);
    }, expireAfter as number);
  } else {
    return {
      unmount: () => {
        toastElement.removeChild(elementToRemove);
      },
      edit: (
        newText: "@original" | string,
        style?: "success" | "warn" | "danger"
      ) => {
        if (newText && newText !== "@original") {
          elementToRemove.innerHTML = `<h1>${newText}</h1>`;
        }
        if (style) {
          elementToRemove.setAttribute("class", `toast toast-${style}`);
        }
      },
    };
  }
}
