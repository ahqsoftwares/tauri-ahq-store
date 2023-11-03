import { Auth, createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

import ScaffoldLogin from "./Base";

interface SignupProps {
  change: (page: string) => void;
  create: typeof createUserWithEmailAndPassword,
  auth: Auth;
  dark: boolean;
}

export default function SignUpPage(props: SignupProps) {
  const {
    auth,
    create
  } = props;

  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | undefined>();

  function reverse(err: string) {
    setPwd("");
    setEmail("");
    setErr(err);
  }

  return <ScaffoldLogin
    e={err}
    onSubmit={
      async () => {
        if (step == 2) {
          await create(auth, email, pwd)
            .then(() => {
              auth.signOut();
            })
            .catch((e: Error) => {
              switch (String(e).replace("FirebaseError: Firebase: ", "")) {
                case "Password should be at least 6 characters (auth/weak-password).":
                  reverse("Use a strong password!");
                  break;
                case "Error (auth/email-already-in-use).":
                  reverse("Use unique email address.");
                  break;
                default:
                  reverse("Unknown error");
              }
              setStep(1);
            });
        } else {
          setStep((s) => s + 1);
        }
      }
    }
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