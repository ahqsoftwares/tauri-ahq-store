import { Auth } from "../auth";
import { useState } from "react";

import ScaffoldLogin from "./Base";
import { invoke } from "@tauri-apps/api/core";
import { login } from "../auth/login";

interface LoginProps {
  change: (page: string) => void;
  auth: Auth;
  dark: boolean;
}

export default function LoginPage(props: LoginProps) {
  const { auth } = props;

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setE] = useState<string | undefined>();

  function reverse(err: string) {
    setE(err);
    setPwd("");
  }

  return (
    <ScaffoldLogin
      e={err}
      onSubmit={async () => {
        try {
          let data = await invoke("encrypt", {
            payload: pwd,
          });

          localStorage.setItem("email", email);
          localStorage.setItem("password", JSON.stringify(data));
        } catch (_) {}

        await login(auth, email, pwd)
          .then((ok) => {
            if (ok) {
              setE("");
            } else {
              setE("Invalid username/password or RateLimit");
            }
          })
          .catch(() => {
            reverse("Fetch Error");
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

          <button className="button" type="submit">
            Login
          </button>
        </>
      }
      button1={{
        label: "Create your account",
        onClick: () => {
          props.change("signup");
        },
      }}
      button2={{
        label: "Forgot Password?",
        onClick: () => {
          props.change("reset");
        },
      }}
      dark={props.dark}
    />
  );
}
