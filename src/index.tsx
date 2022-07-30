import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './config/App';
import Store from "./app/index";
import reportWebVitals from './reportWebVitals';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';

(async() => {
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }
  if (permissionGranted) {
    sendNotification({ title: 'Development Build', body: 'Not for consumer use'});
  }
})()

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

render("Checking for updates...", App);

checkUpdate().then(async({shouldUpdate, manifest}) => {
  if (shouldUpdate) {
    render(`Update to ${manifest?.version} Available...`, App);
    setTimeout(async() => {
      render(`Installing ${manifest?.version}`,  App);
      setTimeout(async() => {
        await installUpdate();
        await relaunch();
      }, 3000);
    }, 5000);
  } else {
    render("Launching Store...", App);
    setTimeout(async() => {
      root.render(
        <React.StrictMode>
          <Store />
        </React.StrictMode>
      )
    }, 2000);
  }
});

function render(state: string, App: any) {
  root.render(
    <React.StrictMode>
      <App info={state}/>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
