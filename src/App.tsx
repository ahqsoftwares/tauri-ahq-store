import React, {useEffect, useState} from 'react';
import {getVersion} from "@tauri-apps/api/app";
import logo from './AHQ Store.png';
import './App.css';

function App() {
  let [version, setVersion] = useState("");
  useEffect(() => {
    (async() => {
      setVersion(String(await getVersion()));
    })()
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="Loading" />
        <p>
          Loading AHQ Store {version}
        </p>
      </header>
    </div>
  );
}

export default App;
