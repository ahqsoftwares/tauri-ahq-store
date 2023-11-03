import { Auth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";

import ScaffoldLogin from "./Base";
import { sendNotification } from "@tauri-apps/api/notification";

interface ResetProps {
  change: (page: string) => void;
  auth: Auth;
  dark: boolean;
  email: typeof sendPasswordResetEmail,
}

export default function ResetPage(props: ResetProps) {
  const { email: sendEmail, auth } = props,
    [email, setEmail] = useState(""),
    [step, setStep] = useState(1),
    [errors, setE] = useState("");

  const [err, setErr] = useState<string | undefined>();

  function reverse(err: string) {
    setErr(err);
    setStep(1);
  }

  return <ScaffoldLogin
    e={err}
    onSubmit={() => {
      switch (step) {
        case 1:
          setStep(step + 1);
          sendEmail(auth, email)
            .then(() => {
              sendNotification({
                title: "Password Reset",
                body: "Password Reset Link sent successfully!",
                icon: "icons/pwd_reset.png"
              });
              props.change("login");
            })
            .catch((e: Error) => {
              switch (String(e)) {
                case "FirebaseError: Firebase: Error (auth/user-not-found).":
                  reverse("Invalid Email");
                  break;
                default:
                  reverse("Unknown Error");
              }
            });
          break;
        default:
          setE("Page Not Found!");
          setStep(0);
      }
    }}
    title="Restore"
    subtitle="Reset the password via email"
    body={
      <>
        <input
          type="email"
          autoComplete={"off"}
          disabled={step !== 1}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={true}
        />

        <button className="button" disabled={step === 2}>
          {step === 1 ? "Email Me!" : step === 3 ? "✔️" : "⏲️"}
        </button>
      </>
    }
    button1={{
      label: "Login",
      onClick: () => {
        props.change("login");
      }
    }}
    button2={{
      label: "Create your account",
      onClick: () => {
        props.change("signup");
      }
    }}
    dark={props.dark}
  />
}