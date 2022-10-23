/* eslint-disable react-hooks/exhaustive-deps */

/*
React && Native
*/
import { useEffect, useRef, useState } from "react";
import { sendNotification } from "@tauri-apps/api/notification";
import Modal from "react-modal";

/*
Firebase API
*/
import { Auth, updateProfile, User, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { Database } from "firebase/database";
import { Firestore } from "firebase/firestore";
import { FirebaseStorage, getDownloadURL, ref, uploadBytes, list, deleteObject } from "firebase/storage";

/*Icons
*/
import { BsPen, BsPenFill } from "react-icons/bs";

/*
Database Refs
*/
import GeneralUser from "./user.png";
import Loading from "./loading.gif";
import { BiLogOut, BiUserX } from "react-icons/bi";


/*
Interfaces
*/
interface UserProps {
    auth: Auth,
    dark: boolean,
    firebase: {
        db: Firestore,
        cache: Database,
        storage: FirebaseStorage
    }
}

/*
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.75)'
    },
    content: {
      position: 'absolute',
      top: '40px',
      left: '40px',
      right: '40px',
      bottom: '40px',
      border: '1px solid #ccc',
      background: '#fff',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      borderRadius: '4px',
      outline: 'none',
      padding: '20px'
    }
*/

export default function Init(props: UserProps){
        Modal.setAppElement('#root');

        function darkMode(classes: Array<string>, dark: boolean) {
            return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
        }


        let {auth, dark, firebase} = props,
        {storage} = firebase;


        let 
        [user, setUser] = useState(Loading),

        [name, setName] = useState(""),

        [alt, setAlt] = useState("Please wait..."),

        refer = useRef<HTMLInputElement>(null),

        [showDelete, setDelete] = useState(false),

        [deletePwd, setPwd] = useState(""),

        [Pen, setPen] = useState(dark ?  <BsPen size="2em"/> : <BsPenFill size="2em"/>),

        [namePopup, setNamePopup] = useState(false);


        const customStyles = {
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                width: "30rem",
                height: "40rem",
                transition: "all 500ms linear",
                "backgroundColor": props.dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
                borderColor: props.dark ? "rgb(55, 65, 81)" : "rgb(209, 213, 219)",
            },
            overlay: {
                backgroundColor: !props.dark ? "rgb(55, 65, 81, 0.5)" : "rgb(107, 114, 128, 0.75)"
            }
        };

         
        useEffect(() => {
                (async() => {
                    if (!auth.currentUser?.emailVerified) {
                        setAlt("Verify email to upload");
                        setUser(GeneralUser);
                        setName("Guest");
                    } else {
                        if (auth.currentUser?.displayName) {
                            if (auth.currentUser?.displayName.startsWith("(dev)")) {
                                setName(auth.currentUser?.displayName.replace("(dev)", ""));
                            } else {
                                setName(auth.currentUser?.displayName);
                            }
                        } else {
                            setName("Guest");
                        }
                        setUser(auth.currentUser?.photoURL ? auth.currentUser.photoURL as string: GeneralUser);
                        setAlt(auth.currentUser?.photoURL ? "Click to edit picture" : "Click to upload");
                    }
                })();
        }, [auth.currentUser]);

         useEffect(() => {
            const image = document.getElementById("img") as HTMLElement,
            drop = document.getElementById("drop") as HTMLElement,
            file = document.getElementById("profile-input") as any;

            image.addEventListener("mouseover", () => {
               drop.setAttribute("style", "opacity: 0.9");
            });
            image.addEventListener("mouseleave", () => {
                drop.setAttribute("style", "opacity: 0.0");
            });
            image.addEventListener("click", () => {
               if (auth.currentUser?.emailVerified) {
                    file.click();
                   }
                });
                file.addEventListener("change", (event: any) => {
                    const fs = new FileReader();

                    if (!event.target.files[0].type.startsWith("image/")) {
                        sendNotification("Non image files are not supported!");
                        return;
                    }

                    const type = event.target.files[0].type.replace("image/", "");

                    fs.readAsArrayBuffer(event.target.files[0]);
                    fs.onload = async() => {
                        await ChangeProfile(type, auth, setAlt, setUser, event, storage, fs);
                    }
                  });
         }, []);

         /*manage();*/
         

        return (
                <>
                    <Modal
                        isOpen={showDelete}
                        contentLabel={"Confirm Delete Account"}
                        style={customStyles}
                    >
                        < DeleteAccount auth={auth} cancel={() => {setDelete(false); setPwd("");}} pass={deletePwd} set={{pwd: setPwd}} dark={props.dark} />
                    </Modal>

                    <Modal
                        isOpen={namePopup}
                        contentLabel="Change Name"
                        style={customStyles}
                    >
                        <ChangeAccountName close={() => setNamePopup(false)} user={auth.currentUser as User} updateName={((value: string) => setName(value))} dark={props.dark}/>
                    </Modal>


                    <div className={`${darkMode(["menu"], dark)} pb-2`}>
                        <div className={`${darkMode(["user"], dark)} pb-2`}>
                            {auth.currentUser?.emailVerified
                            ?
                            <></>
                            :
                            <div className="flex flex-col text-center">
                                <h1
                                    style={{"color": "red","fontSize" : "20px"}}
                                >Unverified Email</h1>
                            </div>}
                            <div className="img" id="img">
                                <input ref={refer} type="file" max={1} min={1} accept="image/*" id="profile-input" hidden></input>
                                <img src={auth.currentUser?.emailVerified ? user : GeneralUser} alt="Avatar" />
                                <div className={`div ${props.dark ? "" : "div-l"}`} id="drop">
                                    <h1 className="text">{alt}</h1>
                                </div>
                            </div>
                                    <div className="flex flex-col text-center mt-2 name">
                                        <div className="flex justify-center">
                                            <h1>{name}</h1>
                                            { auth.currentUser?.emailVerified ?
                                            <>
                                                <div className="ml-[0.5rem]"></div>
                                                <span 
                                                    onMouseLeave={() => {
                                                        setPen(dark ?  <BsPen size="2em"/> : <BsPenFill size="2em"/>);
                                                    }}  
                                                    onMouseEnter={() => {
                                                        setPen(dark ? <BsPenFill size="2em"/> : <BsPen size="2em"/>);
                                                    }}
                                                    style={{
                                                        "cursor": "pointer"
                                                    }}
                                                    onClick={() => setNamePopup(true)}
                                                >
                                                    {Pen}
                                                </span>
                                            </>
                                            : <></>}
                                        </div>
                                        <h6>{auth.currentUser?.email}</h6>
                                    </div>
                           </div>
                           <Actions auth={auth} deleteAcc={setDelete} />
                    </div>
                </>
        );
}

function Actions(props: {auth: Auth, deleteAcc: Function}) {
    const {auth, deleteAcc} = props;
    return (
        <div className="flex flex-col">
            <div className="flex w-[100%] flex-row">
                <button className="button mx-auto flex items-center text-center justify-center" onClick={() => auth.signOut()} style={{"minWidth": "15rem", "maxWidth": "15rem", "minHeight": "3.5rem", "maxHeight": "3.5rem"}}>
                    <BiLogOut size="2.5em"/>
                    <p className="mx-2">LogOut</p>
                </button>
                <div className="mx-3"></div>
                <button className="button-danger mx-auto flex items-center text-center justify-center" onClick={() => deleteAcc(true)} style={{"minWidth": "15rem", "maxWidth": "15rem", "minHeight": "3.5rem", "maxHeight": "3.5rem"}}>
                    <BiUserX size="2.5em"/>
                    <p className="mx-2">Delete Account</p>
                </button>
            </div>
        </div>
    );
}

interface DeleteAccountProps {
    auth: Auth,
    cancel: Function,
    pass: string,
    dark: boolean,
    set: {
        pwd: Function
    }
}

function DeleteAccount(props: DeleteAccountProps) {
    const {cancel, pass, set, auth, dark} = props;
    const {pwd: sP} = set;

    const user: any = auth.currentUser;
    let [text, setText] = useState("Delete My Account;-danger;false"),
    [step, setStep] = useState(0),
    [err, setErr] = useState("");

    function reverse(err: string) {
        setErr(err);
        setText("Delete My Account;-danger;false");
    }

    async function ManageDelete(event: any) {
        event.preventDefault();
        setText(`⏲️;;true`);
        await reauthenticateWithCredential(auth.currentUser as User, EmailAuthProvider.credential(auth.currentUser?.email as string, pass))
        .then(() => {
            setStep(1);
        })
        .catch((e) => {
            let msg = e.message.replace("Firebase: Error ", "").replace(")", "").replace("(", "").replaceAll(".", "");

            switch(msg) {
                case "auth/wrong-password":
                    reverse("Wrong Passwod!");
                    break;
                case "Firebase: Access to this account has been temporarily disabled due to many failed login attempts You can immediately restore it by resetting your password or you can try again later auth/too-many-requests":
                    reverse("Too many login attempts!");
                    break;
                default:
                    reverse("Unknown Error!");
                    break;
            }
        });
    }

    async function ConfirmDelete(e: any) {
        e.preventDefault();
        await auth.currentUser?.delete();
    }

    return (
        <div className="flex flex-col" style={{"transition": "all 250ms linear"}}>
            <div className="flex flex-row">
                <div className="mx-auto"></div>
                <button className={`${dark ? "text-white" : "text-black"} hover:text-red-500 h-[1rem] w-[1rem]`} style={{"fontWeight": "bolder", "transition": "all 250ms linear"}} onClick={() => cancel()}>X</button>
            </div>

            <div className="mt-[8rem]"></div>

            <h2 className="text-center text-red-700" style={{"fontSize": "25px"}}>{err}</h2>

            <div className="mt-[2rem]"></div>
            
            <div className="flex flex-col">
                <form className="flex flex-col items-center" onSubmit={step === 0 ? ManageDelete : ConfirmDelete}>
                    {step === 0 ? 
                        <>

                        <input className={`style-input ${!props.dark ? "" : "style-input-d"}`} disabled type="email" placeholder="Enter Your Email" value={user.email} required></input>

                        <div className="mt-[1rem]"></div>

                        <input className={`style-input ${!props.dark ? "" : "style-input-d"}`} type="password" placeholder="Enter Your Password" minLength={8} value={pass} onChange={(e) => sP(e.target.value)} required disabled={text.split(";")[2] === "true"}></input>

                        <div className="mt-[12.5rem]"></div>
                        <button className={`button${text.split(";")[1]} flex items-center text-center justify-center`} style={{"transition": "all 500ms linear"}} disabled={text.split(";")[2] === "true"}><BiUserX size="2.5em" className="mx-2"/> {text.split(";")[0]}</button>

                        </>
                    :
                        <>
                            <h1>Are you sure you want to delete your account?</h1>
                            <div className="mt-[14rem]"></div>
                            <div className="flex">
                                <div className="w-[10rem] ml-[4rem]"></div>
                                <div className="w-[10rem]">
                                    <button type="reset" className="button" onClick={() => cancel()}>No</button>
                                </div>
                                <div className="w-[10rem]">
                                    <button className="button-danger"><BiUserX size="2.5em"/> Yes</button>
                                </div>
                                <div className="w-[10rem]"></div>
                            </div>
                        </>
                    }
                </form>
            </div>
        </div>
    )
}

interface AccountNameProps {
    close: Function,
    user: User,
    updateName: Function,
    dark: boolean
}
function ChangeAccountName(props: AccountNameProps) {
    const {close, user, updateName} = props;
    const name = user.displayName as string;
    const dev = name.startsWith("(dev)");

    let [value, setValue] = useState(dev ? name.replace("(dev)", "") : name);

    async function confirmName(e: {preventDefault: Function}) {
        close();
        e.preventDefault();
        try {
            if (user.displayName !== value) {
                await updateProfile(user, {
                    displayName: dev ? `(dev)${value}` : value
                });
            }
            updateName(value);
            setValue("");
        } catch (e) {
            sendNotification({title: "Error", body: "Could not set name"});
        }
    }

    return (
        <div className="flex flex-col" style={{"transition": "all 250ms linear"}}>
            <div className="flex flex-row">
                <div className="mx-auto"></div>
                <button className="text-black hover:text-red-500 h-[1rem] w-[1rem]" style={{"fontWeight": "bolder", "transition": "all 250ms linear"}} onClick={() => close()}>X</button>
            </div>

            <div className="mt-[10rem]"></div>

            <div className="flex flex-col">
                <form className="flex flex-col items-center" onSubmit={confirmName}>
                    <input className={`style-input ${!props.dark ? "" : "style-input-d"}`} type="string" placeholder="Enter Name for Profile" maxLength={32} minLength={6} value={value} onChange={
                        ((e) => {
                            if (e.target.value.startsWith("(dev)")) {
                                setValue(e.target.value.replace("(dev)", ""));
                            } else {
                                setValue(e.target.value);
                            }
                        })
                    } required></input>

                    <div className="mt-[15rem]"></div>

                    <button className={`button`} style={{"transition": "all 500ms linear"}}>Confirm</button>
                </form>
            </div>
        </div>
    )
}

async function ChangeProfile(type: string, auth: Auth, setAlt: Function, setUser: Function, event: any, storage: FirebaseStorage, fs: any) {
    try {
        const location = ref(storage, `${auth.currentUser?.uid}/profile.${type}`);
        setUser(Loading);

        try {
            await list(ref(storage, auth.currentUser?.uid))
            .then(async(data) => {
                for (let i = 0; i < data.items.length; i++) {
                        const e = data.items[i];
                        await deleteObject(ref(storage, e.fullPath));
                }
            });
        } catch (e) {
            console.log(e);
        }

        await uploadBytes(location, fs.result as ArrayBuffer, {
            contentType: String(event.target.files[0].type)
        });

        await getDownloadURL(location)
        .then((data) => {
            if (auth.currentUser?.emailVerified) {
                setAlt("Click to edit picture");
            }
            updateProfile(auth.currentUser as User, {
                photoURL: data
            });
            setUser(data);
        })
        .catch((e) => {
            console.log(e);
            if (auth.currentUser?.emailVerified) {
                setAlt("Click to upload");
            }
            updateProfile(auth.currentUser as User, {
                photoURL: GeneralUser
            });
            setUser(GeneralUser);
        });
    } catch (e) {
        setUser(auth.currentUser?.photoURL ? auth.currentUser.photoURL : GeneralUser);
        sendNotification("Failed to update profile picture!");
    }
}