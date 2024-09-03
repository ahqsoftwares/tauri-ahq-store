import react from "eslint-plugin-react-compiler";

export default [
  {
    files: ["**/*.js"],
    plugins: {
      "react-compiler": react,
    },
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },
];
