import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";

import { useState, useEffect } from "react";
import { getCurrent } from "@tauri-apps/api/window";
import fetchPrefs, { appData } from "./app/resources/utilities/preferences";

import Login from "./Login/Login";
import SignUp from "./Login/Signup"
import ForgotPwd from "./Login/Forgot";

interface LoginHandlerProps {
  create: typeof createUserWithEmailAndPassword,
  login: typeof signInWithEmailAndPassword,
  auth: Auth,
  resetEmail: typeof sendPasswordResetEmail
}

function Init(props: LoginHandlerProps) {
  const { create, login, auth, resetEmail } = props;

  let [type, setType] = useState("login");

  const [prefs, setP] = useState<appData>({
    dark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    autoUpdate: false,
    font: "bhn",
    sidebar: "flex-row",
    debug: false,
    theme: "dark",
  });

  useEffect(() => {
    fetchPrefs().then((preferences) => {
      setP(preferences);
    });
  }, []);

  getCurrent().setTitle("Accounts - AHQ Store");

  const data = (() => {
    switch (type) {
      case "login":
        return <Login
          change={(page: string) => {
            setType(page);
          }}
          login={login}
          auth={auth}
          dark={prefs.dark}
        />;
      case "signup":
        return <SignUp
          change={(page: string) => {
            setType(page);
          }}
          create={create}
          auth={auth}
          dark={prefs.dark}
        />;
      case "reset":
        return <ForgotPwd
          change={(page: string) => {
            setType(page);
          }}
          email={resetEmail}
          auth={auth}
          dark={prefs.dark}
        />;
      default:
        return <></>;
    }
  })();

  return (
    <header className="login-background">
      {data}
    </header>
  );
}

export default Init;
export type { LoginHandlerProps };