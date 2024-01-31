import { Auth } from "../auth";
import { useState } from "react";

import ScaffoldLogin from "./Base";
import { sendNotification } from "@tauri-apps/api/notification";
import { resetPwd } from "../auth/resetPwd";

interface ResetProps {
  change: (page: string) => void;
  auth: Auth;
  dark: boolean;
}

export default function ResetPage(props: ResetProps) {
  const { auth } = props,
    [email, setEmail] = useState(""),
    [step, setStep] = useState(1);

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
          resetPwd(auth, email)
            .then((ok) => {
              if (ok) {
                sendNotification({
                  title: "Password Reset",
                  body: "Password Reset Link sent successfully!",
                  icon: "icons/pwd_reset.png"
                });
                props.change("login");
              } else {
                reverse("Error");
              }
            })
            .catch(() => {
              reverse("Unknown Error");
            });
          break;
        default:
          reverse("Page Not Found!");
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