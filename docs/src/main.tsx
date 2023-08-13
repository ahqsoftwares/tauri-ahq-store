import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import "./ts/index";

import Shell from "./components/Shell";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Shell />
  </React.StrictMode>,
);
