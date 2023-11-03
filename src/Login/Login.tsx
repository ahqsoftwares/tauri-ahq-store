import { Auth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

import ScaffoldLogin from "./Base";
import { invoke } from "@tauri-apps/api/tauri";

interface LoginProps {
  change: (page: string) => void;
  auth: Auth;
  login: typeof signInWithEmailAndPassword;
  dark: boolean;
}

export default function LoginPage(props: LoginProps) {
  const {
    login,
    auth
  } = props;

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setE] = useState<string | undefined>();

  function reverse(err: string) {
    setE(err);
    setPwd("");
  }

  return <ScaffoldLogin
    e={err}
    onSubmit={async () => {
      console.log("Received");
      try {
        let data = await invoke("encrypt", {
          payload: pwd,
        });

        localStorage.setItem("email", email);
        localStorage.setItem("password", JSON.stringify(data));
      } catch (_) { }

      console.log("Loggging");

      await login(auth, email, pwd)
        .then(() => {
          console.log("Done");
          setE("");
        })
        .catch((e: any) => {
          let msg = e.message
            .replace("Firebase: Error ", "")
            .replace(")", "")
            .replace("(", "")
            .replaceAll(".", "");

          switch (msg) {
            case "auth/wrong-password":
              reverse("Wrong Passwod!");
              break;
            case "Firebase: Access to this account has been temporarily disabled due to many failed login attempts You can immediately restore it by resetting your password or you can try again later auth/too-many-requests":
              reverse("Too many login attempts!");
              break;
            case "auth/user-not-found":
              reverse("No Account Found");
              break;
            default:
              reverse("Invalid username/password");
              break;
          }
        });
    }}
    title="Welcome"
    subtitle="Login to start the journey"
    body={
      <>
        <input
          type={"email"}
          autoComplete={"off"}
          required={true}
          placeholder={"Email ID"}
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        ></input>


        <input
          className="mt-[1rem]"
          type={"password"}
          autoComplete={"off"}
          required={true}
          placeholder={"Password"}
          minLength={8}
          onChange={(e) => setPwd(e.target.value)}
          value={pwd}
        ></input>

        <button className="button" type="submit">Login</button>
      </>
    }
    button1={{
      label: "Create your account",
      onClick: () => {
        props.change("signup");
      }
    }}
    button2={{
      label: "Forgot Password?",
      onClick: () => {
        props.change("reset");
      }
    }}
    dark={props.dark}
  />
}