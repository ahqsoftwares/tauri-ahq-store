const toastElement = document.getElementById("toast") as HTMLDivElement;

export default function Toast(
  text: string,
  type: "success" | "warn" | "danger",
  expireAfterSeconds: number | "never"
) {
  const toast = document.createElement("div");
  toast.setAttribute("class", `toast toast-${type}`);
  toast.innerHTML = `<h1>${text}</h1>`;

  const elementToRemove = toastElement.appendChild(toast);

  if (expireAfterSeconds !== "never") {
    setTimeout(() => {
      elementToRemove.setAttribute("hidden", "true");
      setTimeout(() => {
        toastElement.removeChild(elementToRemove);
      }, (expireAfterSeconds * 1000) + 1000);
    }, expireAfterSeconds * 1000);
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
