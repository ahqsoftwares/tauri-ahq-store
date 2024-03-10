import { Auth, logOut } from "../auth";
import { useState } from "react";

import ScaffoldLogin from "./Base";
import { signUp } from "../auth/signup";

interface SignupProps {
  change: (page: string) => void;
  auth: Auth;
  dark: boolean;
}

export default function SignUpPage(props: SignupProps) {
  const { auth } = props;

  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | undefined>();

  function reverse(err: string) {
    setPwd("");
    setEmail("");
    setErr(err);
  }

  return (
    <ScaffoldLogin
      e={err}
      onSubmit={async () => {
        if (step == 2) {
          await signUp(auth, { email, pass_word: pwd })
            .then(([ok, msg]) => {
              if (ok) {
                logOut(auth);
              } else {
                reverse(msg);
                setStep(1);
              }
            })
            .catch(() => {
              reverse("Unknown error occured");
              setStep(1);
            });
        } else {
          setStep((s) => s + 1);
        }
      }}
      title="Sign Up"
      subtitle="Create your new account"
      body={
        <>
          <input
            type={"email"}
            autoComplete={"off"}
            required={true}
            placeholder={"Email ID"}
            disabled={step === 2}
            onChange={(e) => {
              if (step === 1) {
                setEmail(e.target.value);
              } else {
                e.target.value = email;
              }
            }}
          />

          {step > 1 ? (
            <input
              type={"password"}
              className="mt-3"
              required={true}
              minLength={8}
              placeholder={"Password"}
              onChange={(e) => {
                if (step === 2) {
                  setPwd(e.target.value);
                } else {
                  e.target.value = pwd;
                }
              }}
            />
          ) : (
            <></>
          )}

          <button className="button">Continue</button>
        </>
      }
      button1={{
        label: "Login",
        onClick: () => {
          props.change("login");
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
