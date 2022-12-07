// React
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from './register-worker';

// Functions and Components
import App from "./IndexPage";

// CSS
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

if (document.location.pathname === "/") {
  root.render(<App path={document.location.pathname} />);
}

serviceWorkerRegistration.unregister();
reportWebVitals();
