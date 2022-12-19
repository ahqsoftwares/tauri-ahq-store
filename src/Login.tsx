import { useState, useEffect } from "react";
import { getCurrent } from "@tauri-apps/api/window";
import fetchPrefs, { appData } from "./app/resources/utilities/preferences";

/**
 * Forgot Password Component
 * @param props
 * @returns {JSX.Element} Component
 */
function ForgotPwd(props: any) {
  let { email: Email, auth } = props,
    [email, setEmail] = useState(""),
    [step, setStep] = useState(1),
    [errors, setE] = useState("");

  function submit(event: any) {
    event.preventDefault();
    switch (step) {
      case 1:
        setStep(step + 1);
        Email(auth, email)
          .then(() => {
            setStep(3);
            setE("");
          })
          .catch((e: Error) => {
            switch (String(e)) {
              case "FirebaseError: Firebase: Error (auth/user-not-found).":
                setE("Invalid Email");
                break;
              default:
                setE("Unknown Error");
            }
            setStep(0);
          });
        break;
      case 3:
        props.change("login");
        break;
      default:
        setE("Page Not Found!");
        setStep(0);
    }
  }

  return (
    <>
      <div className="mt-10"></div>
      <h1>Restore</h1>
      <h2>Reset your password!</h2>

      <div className="mt-auto"></div>

      <form
        className={`modal ${props.dark ? "modal-d" : ""}`}
        onSubmit={submit}
      >
        <div className="mt-auto"></div>

        {step !== 0 ? (
          <>
            {step === 3 ? (
              <h6 className="text-green-700 mb-2">
                Password reset email sent successfully!
              </h6>
            ) : (
              <></>
            )}

            <input
              type="email"
              autoComplete={"off"}
              disabled={step !== 1}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={true}
            ></input>

            <div className="mt-auto"></div>

            <button className="button" disabled={step === 2}>
              {step === 1 ? "Email Me!" : step === 3 ? "✔️" : "⏲️"}
            </button>

            <div className="mb-[2rem]"></div>
          </>
        ) : (
          <>
            <h2
              className="text-red-800 m-auto mb-[12rem]"
              style={{ color: "red" }}
            >
              <strong>{errors}</strong>
            </h2>
            <button
              className="button"
              onClick={() => {
                setStep(1);
                setEmail("");
              }}
            >
              Try Again
            </button>
            <div className="mb-[2rem]"></div>
          </>
        )}
      </form>
      {step === 1 ? (
        <div className={`flex w-[90%] ${props.dark ? "text-white" : ""}`}>
          <button
            onClick={() => {
              props.change("login");
            }}
          >
            Login
          </button>

          <div className="ml-auto"></div>

          <button
            onClick={() => {
              props.change("signup");
            }}
          >
            Create your account!
          </button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

function SignUp(props: any) {
  const { create, auth } = props;
  let [email, setEmail] = useState(""),
    [step, setStep] = useState(1),
    [pwd, setPwd] = useState(""),
    [err, setErr] = useState("");

  async function contd(event: any) {
    event.preventDefault();
    if (step === 2) {
      await create(auth, email, pwd)
        .then(() => {
          auth.signOut();
        })
        .catch((e: Error) => {
          switch (String(e).replace("FirebaseError: Firebase: ", "")) {
            case "Password should be at least 6 characters (auth/weak-password).":
              setErr("Use a strong password!");
              break;
            case "Error (auth/email-already-in-use).":
              setErr("Use unique email address.");
              break;
            default:
              setErr("Unknown error");
          }
          setStep(0);
        });
    } else {
      setStep(step + 1);
    }
  }

  return (
    <>
      <div className="mt-10"></div>
      <h1>Sign Up</h1>
      <h2>Create your new account</h2>

      <div className="mt-auto"></div>

      {step !== 0 ? (
        <form
          className={`modal ${props.dark ? "modal-d" : ""}`}
          onSubmit={contd}
        >
          <div className="mt-auto"></div>

          <input
            type={"email"}
            autoComplete={"off"}
            required={true}
            placeholder={"Email ID"}
            disabled={step === 2}
            hidden={step === 3}
            onChange={(e) => {
              if (step === 1) {
                setEmail(e.target.value);
              } else {
                e.target.value = email;
              }
            }}
          ></input>

          {step > 1 ? (
            <>
              <div className="mt-[1rem]"></div>
              <input
                type={"password"}
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
              ></input>
            </>
          ) : (
            <></>
          )}

          <div className="mt-auto"></div>

          <button className="button">Continue</button>

          <div className="mt-auto"></div>
          <div className="mb-[1rem]"></div>
        </form>
      ) : (
        <>
          <h2 style={{ color: "red", marginBottom: "1rem" }}>{err}</h2>
          <button
            className="button"
            onClick={() => {
              setStep(1);
              setEmail("");
              setPwd("");
            }}
          >
            Try Again
          </button>
        </>
      )}

      {step === 1 ? (
        <div className={`flex w-[90%] ${props.dark ? "text-white" : ""}`}>
          <button
            onClick={() => {
              props.change("login");
            }}
          >
            Login
          </button>
          <div className="ml-auto"></div>
          <button
            onClick={() => {
              props.change("reset");
            }}
          >
            Forgot Password?
          </button>
        </div>
      ) : (
        <></>
      )}

      <div className="mb-auto"></div>
    </>
  );
}

type log = {
  change: Function;
  auth: any;
  login: any;
  dark: boolean;
};
function Login(props: log) {
  const { auth, login, dark } = props;

  let [e, setE] = useState(""),
    [email, setEmail] = useState(""),
    [pwd, setPwd] = useState("");

  return (
    <>
      <div className="mt-10"></div>

      <h1 className="line">Welcome</h1>
      <h2 className="line">Login to start your journey!</h2>
      <h3 style={{ color: "red" }}>{e}</h3>

      <div className="mt-[15rem]"></div>

      <form
        className={`modal ${dark ? "modal-d" : ""}`}
        onSubmit={(e) => {
          e.preventDefault();
          login(auth, email, pwd)
            .then(() => {
              setE("");
            })
            .catch((e: any) => {
              let msg = e.message
                .replace("Firebase: Error ", "")
                .replace(")", "")
                .replace("(", "")
                .replaceAll(".", "");
              //console.log(msg);
              function reverse(err: string) {
                setE(err);
                setPwd("");
              }

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
      >
        <input
          type={"email"}
          autoComplete={"off"}
          required={true}
          placeholder={"Email ID"}
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        ></input>
        <div className="mt-[1rem]"></div>
        <input
          type={"password"}
          required={true}
          placeholder={"Password"}
          minLength={8}
          onChange={(e) => setPwd(e.target.value)}
          value={pwd}
        ></input>

        <button className="button">Login</button>
      </form>

      <div className="mt-auto"></div>

      <div className={`flex w-[90%] ${dark ? "text-white" : ""}`}>
        <button
          onClick={() => {
            props.change("signup");
          }}
        >
          Create your account!
        </button>
        <div className="ml-auto"></div>
        <button
          onClick={() => {
            props.change("reset");
          }}
        >
          Forgot Password?
        </button>
      </div>

      <div className="mb-auto"></div>
    </>
  );
}

function Init(props: any) {
  const { create, login, verify, reset, auth, verifyCode, resetEmail } =
    props.data;
  let [type, setType] = useState("login");
  const [prefs, setP] = useState<appData>({
    dark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    autoUpdate: false,
    font: "bhn",
  });

  useEffect(() => {
    fetchPrefs().then((preferences) => {
      setP(preferences);
    });
  }, []);

  getCurrent().setTitle("Accounts - AHQ Store");

  return (
    <header className="login-background">
      <div className={`modal ${prefs?.dark ? "modal-d" : ""}`}>
        {type === "login" ? (
          <Login
            change={(page: string) => {
              setType(page);
            }}
            login={login}
            auth={auth}
            dark={prefs.dark}
          />
        ) : (
          <></>
        )}

        {type === "signup" ? (
          <SignUp
            change={(page: string) => {
              setType(page);
            }}
            create={create}
            verify={verify}
            auth={auth}
            dark={prefs.dark}
          />
        ) : (
          <></>
        )}

        {type === "reset" ? (
          <ForgotPwd
            change={(page: string) => {
              setType(page);
            }}
            reset={reset}
            verify={verifyCode}
            email={resetEmail}
            auth={auth}
            dark={prefs.dark}
          />
        ) : (
          <></>
        )}
      </div>
    </header>
  );
}

export default Init;
