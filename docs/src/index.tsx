// React
import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

// Functions and Components
import App from "./App";

// CSS
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
/*const component = Pages(document.location.pathname);*/

root.render(
  <App 
    path={document.location.pathname}
  />
);

reportWebVitals();