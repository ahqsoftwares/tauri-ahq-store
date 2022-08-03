import {useState} from "react";

function SignUp(props: any) {
         let [email, setEmail] = useState(""),
         [step, setStep] = useState(1),
         [pwd, setPwd] = useState("");

         function contd(event: any) {
                  console.log(event);
                  event.preventDefault();
                  if (step === 3) {
                           setStep(1);
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

                                    <input type={"email"} required={true} placeholder={"Email ID"} onChange={(e) => {
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

                           <div className="mt-2"></div>
                           
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

                           <div className="mt-auto"></div>
                  </>
         )
}

function Init(props: any) {
         const {create, login, verify, /*reset,*/ auth} = props.data;
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
                                             }} create={create} verify={verify}/> : <></>}

                                             {type === "reset" ?
                                             <></> : <></>}
                           </div>
                  </header>
         )
}

export default Init;