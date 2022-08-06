import {useState} from "react";
import { sendNotification } from "@tauri-apps/api/notification";

function ForgotPwd(props: any) {
         let 
         {reset, verify, email: Email, auth} = props,
         [email, setEmail] = useState(""),
         [password, setPwd]  = useState(""),
         [code, setCode] = useState(""),
         [step, setStep] = useState(1),
         [errors, setE] = useState("");

         function submit(event: any) {
                  event.preventDefault();
                  switch (step) {
                           case 1:
                                    setStep(step + 1);
                                    Email(auth, email)
                                    .catch(() => {
                                             setStep(0);
                                    });
                                    break;
                           case 2:
                                    setStep(3);
                                    verify(auth, code).then((res: string | null) => {
                                             if (res === email) {
                                                      setStep(4);
                                                      setE("");
                                             } else {
                                                      setStep(2);
                                                      setE("Invalid verification code!");
                                                      sendNotification({
                                                               title: "Invalid Verification Code!",
                                                               body: "Please enter the correct verification code!"
                                                      });
                                             }
                                    }).catch(() => {
                                             setStep(2);
                                             setE("Invalid verification code!");
                                             sendNotification({
                                                      title: "Invalid Verification Code!",
                                                      body: "Please enter the correct verification code!"
                                             });
                                    });
                                    break;
                           case 4:
                                    reset(auth, code, password).then(() => {
                                             setStep(5);
                                             setTimeout(() => {
                                                      props.change("login");
                                             }, 2000);
                                    }).catch(() => {
                                             setStep(0);
                                    });
                                    break;
                           default:
                                    setStep(0);
                  }
         }

         return(
                  <>
                           <div className="mt-10"></div>
                           <h1>Restore</h1>
                           <h2>Reset your password!</h2>
                           <h2>{errors}</h2>

                           <div className="mt-auto"></div>

                           <form className="modal" onSubmit={submit}>
                                    <div className="mt-auto"></div>

                                    { step !== 0 ? 
                                    <>

                                    {step < 3 ?
                                             <input type="email" disabled={step !== 1} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required={true}></input>
                                    : <></>}

                                    {step > 1 && step < 5 ?
                                    <>
                                             <div className="mt-[1rem]"></div>
                                             <h6 style={{"transitionDuration": "500ms"}} className={`mr-auto ml-[5%] transition-all ${(code === "" || code.length !== 6) ? "text-red-900" : step === 3 ? "text-black" : "text-green-600"}`}>{step < 3 ? "Please enter the code sent to your email" : "Verification Code"}</h6>
                                             <input disabled={step > 2} placeholder="Code" value={code} onChange={(e) => setCode(e.target.value.replaceAll(" ", ""))} required={true}></input>
                                    </>         
                                    : <></>}

                                    {step === 4 ?
                                    <>
                                             <div className="mt-[1rem]"></div>
                                             <input disabled={step !== 4} placeholder="New Password" value={password} onChange={(e => setPwd(e.target.value))} required></input>
                                    </>
                                    : <></>}

                                    {step === 5 ?
                                    <h1>Success!</h1>
                                    : <></> }

                                    <div className="mt-auto"></div>
                                    
                                    <button className="button" disabled={step === 3}>{step < 2 ? "Continue" : step === 3 ? "Please Wait..." : "Submit"}</button>
                                    
                                    <div className="mb-[2rem]"></div>

                                    </>
                                    : <h2 className="text-red-800 m-auto mb-[12rem]" style={{"color": "red"}}><strong>An Error Occured</strong></h2>}

                           </form>

                           <div className="flex w-[90%]">
                                    <button onClick={() => {
                                             props.change("login");
                                    }}>Login</button>

                                    <div className="ml-auto"></div>

                                    <button onClick={() => {
                                             props.change("signup");
                                    }}>
                                             Create your account!
                                    </button>
                                    
                           </div>
                  </>
         )
}

function SignUp(props: any) {
         const {create, auth} = props;
         let [email, setEmail] = useState(""),
         [step, setStep] = useState(1),
         [pwd, setPwd] = useState("");

         async function contd(event: any) {
                  console.log(event);
                  event.preventDefault();
                  if (step === 3) {
                           await create(auth, email, pwd)
                           .then(() => {
                                    auth.signOut();
                           })
                           .catch((e: Error) => {
                                    console.log(e)
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
                           
                           <form className="modal" onSubmit={contd}>
                                    <div className="mt-auto"></div>

                                    <input type={"email"} required={true} placeholder={"Email ID"} disabled={step === 2} hidden={step === 3} onChange={(e) => {
                                             if (step === 1) {
                                                      setEmail(e.target.value);
                                             } else {
                                                      e.target.value = email;
                                             }
                                    }}></input>

                                    {step > 1 ? 
                                             <>
                                                      <div className="mt-[1rem]"></div>
                                                      <input type={"password"} required={true} placeholder={"Password"} onChange={(e) => {
                                                               if (step === 2) {
                                                                        setPwd(e.target.value);
                                                               } else {
                                                                        e.target.value = pwd;
                                                               }
                                                      }}></input>
                                             </>
                                    : <></>}
                           
                                    <div className="mt-auto"></div>
                                    
                                    <button className="button">
                                             Continue
                                    </button>

                                    <div className="mt-auto"></div>
                                    <div className="mb-[1rem]"></div>
                           </form>

                           {step === 1 ?
                           <div className="flex w-[90%]">
                                    <button onClick={() => {
                                             props.change("login");
                                    }}>Login</button>
                                    <div className="ml-auto"></div>
                                    <button onClick={() => {
                                             props.change("reset");
                                    }}>
                                             Forgot Password?
                                    </button>
                           </div>
                           : <></>}

                           <div className="mb-auto"></div>
                  </>
         );
}




type log = {
         change: Function,
         auth: any,
         login: any
}
function Login(props: log) {
         const {auth, login} = props;

         let [e, setE] = useState(""),
         [email, setEmail] = useState(""),
         [pwd, setPwd] = useState("");

         return (
                  <>
                           <div className="mt-10"></div>

                           <h1 className="line">Welcome</h1>
                           <h2 className="line">Login to start your journey!</h2>
                           <h3 style={{"color": "red"}}>{e}</h3>

                           <div className="mt-[15rem]"></div>
                           
                           <form className="modal" onSubmit={(e) => {
                                    e.preventDefault()
                                    login(auth, email, pwd)
                                    .then(() => {
                                             setE("");
                                    })
                                    .catch(() => {
                                             setE("Invalid username/password");
                                             setPwd("");
                                    })
                           }}>
                                    
                                    <input type={"email"} required={true} placeholder={"Email ID"} onChange={(e) => setEmail(e.target.value)} value={email}></input>
                                    <div className="mt-[1rem]"></div>
                                    <input type={"password"} required={true} placeholder={"Password"} onChange={(e) => setPwd(e.target.value)} value={pwd}></input>


                                    <button className="button">Login</button>
                           </form>

                           <div className="mt-auto"></div>
                           
                           <div className="flex w-[90%]">
                                    <button onClick={() => {
                                             props.change("signup");
                                    }}>Create your account!</button>
                                    <div className="ml-auto"></div>
                                    <button onClick={() => {
                                             props.change("reset");
                                    }}>
                                             Forgot Password?
                                    </button>
                           </div>

                           <div className="mb-auto"></div>
                  </>
         )
}

function Init(props: any) {
         const {create, login, verify, reset, auth, verifyCode, resetEmail} = props.data;
         let [type, setType] = useState("login");
         
         return (
                  <header className="login-background">
                           <div className="modal">
                                             {type === "login" ? <Login change={(page: string) => {
                                                      setType(page);
                                             }} login={login} auth={auth}/> : <></>}
                                             
                                             {type === "signup" ? 
                                             <SignUp change={(page: string) => {
                                                      setType(page);
                                             }} create={create} verify={verify} auth={auth}/> : <></>}

                                             {type === "reset" ?
                                             <ForgotPwd change={(page: string) => {
                                                      setType(page);
                                             }} reset={reset} verify={verifyCode} email={resetEmail} auth={auth}/> : <></>}
                           </div>
                  </header>
         )
}

export default Init;