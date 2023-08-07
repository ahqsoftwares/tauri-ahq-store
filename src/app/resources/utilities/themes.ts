const darkThemes = [
  "night",
  "synthwave",
  "halloween",
  "forest",
  "luxury",
  "dracula",
  "business",
];

const themes = [
  "light",
  "bumblebee",
  "emerald",
  "fantasy",
  "wireframe",
  "cmyk",
  "autumn",

  ...darkThemes,
];

export default themes;

export function isDarkTheme(theme: string) {
  return darkThemes.includes(theme);
}

export function defaultDark() {
  return darkThemes[0];
}

export function defaultLight() {
  return themes[0];
}