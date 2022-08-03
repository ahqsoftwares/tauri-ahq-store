/*Main Modules
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

/*Tauri
 */
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';

/*Apps
*/
import App from './config/App';
import Store from "./app/index";
import Login from "./Login";

/*Firebase
*/
import {initializeApp} from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, verifyPasswordResetCode } from "firebase/auth";

/*Global CSS
*/
import './index.css';

/*Constants
*/
const config = {
  apiKey: "AIzaSyAXAkoxKG4chIuIGHPkVG8Sma9mTJqiC84",
  authDomain: "ahq-store.firebaseapp.com",
  databaseURL: "https://ahq-store-default-rtdb.firebaseio.com",
  projectId: "ahq-store",
  storageBucket: "ahq-store.appspot.com",
  messagingSenderId: "460016490107",
  appId: "1:460016490107:web:50123c20ca44ccee3b74de",
  measurementId: "G-TEZS1Y48L1"
};

const app = initializeApp(config);
const auth = getAuth(app);

/*Logic
*/
(async() => {
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  } else {
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

    if (!auth.currentUser) {
      storeLoad(Login, {
        create: createUserWithEmailAndPassword,
        login: signInWithEmailAndPassword,
        verify: sendEmailVerification,
        reset: verifyPasswordResetCode,
        resetEmail: sendPasswordResetEmail,
        auth
      });
    } else {
      storeLoad(Store);
    }

    auth.onAuthStateChanged((user) => {
      user ? storeLoad(Store, {
        auth
      }) : storeLoad(Login, {
        create: createUserWithEmailAndPassword,
        login: signInWithEmailAndPassword,
        verify: sendEmailVerification,
        reset: verifyPasswordResetCode,
        resetEmail: sendPasswordResetEmail,
        auth
      });
    });
  }
});


/**
 * Load a Store Component on the DOM
 * @param Component 
 * @param prop 
 */
function storeLoad(Component: any, prop?: Object) {
    root.render(<React.StrictMode>
      <Component data={prop ? prop : {}}/>
    </React.StrictMode>)
}

/**
 * Loads updater
 * @param {string} state 
 * @param {React.Component} App 
 */
function render(state: string, App: any) {
  root.render(
    <React.StrictMode>
      <App info={state}/>
    </React.StrictMode>
  );
}

reportWebVitals();
