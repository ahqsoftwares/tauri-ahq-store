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
import { Auth, updateProfile, User } from "firebase/auth";
import { Database, ref as refCache, child, get, set } from "firebase/database";
import { Firestore } from "firebase/firestore";
import { FirebaseStorage, getDownloadURL, ref, uploadBytes, list, deleteObject } from "firebase/storage";

/*
Database Refs
*/
import GeneralUser from "./user.png";
import Loading from "./loading.gif";


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
const customStyles = {
  content: {
    top: '20%',
    left: '20%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

export default function Init(props: UserProps){
        Modal.setAppElement('#root');

        function darkMode(classes: Array<string>, dark: boolean) {
            return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
        }
        let [user, setUser] = useState(Loading),
        [name, setName] = useState(""),
        [alt, setAlt] = useState("Please wait..."),
        refer = useRef<HTMLInputElement>(null),
        [showDelete, setDelete] = useState(false);

        let {auth, dark, firebase} = props,
        {db, cache, storage} = firebase;
         
        useEffect(() => {
                (async() => {
                    if (!auth.currentUser?.emailVerified) {
                        setAlt("Verify email to upload");
                        setUser(GeneralUser);
                        setName("Guest");
                    } else {
                        setName(auth.currentUser?.displayName  ? auth.currentUser.displayName as string: "Guest");
                        setUser(auth.currentUser?.photoURL ? auth.currentUser.photoURL as string: GeneralUser);
                        setAlt(auth.currentUser?.photoURL ? "Click to edit picture" : "Click to upload");
                    }
                })();
        }, [auth.currentUser]);

        function getRef(location: string) {
            return ref(storage, location);
        }

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
                                        .catch(() => {
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
                  });
         }, []);

         /*manage();*/
         

         return (
                <>
                    <Modal
                        isOpen={showDelete}
                        contentLabel={"Confirm Delete Account"}
                    >
                        <button onClick={() => setDelete(false)}>Close the modal</button>
                    </Modal>
                    <div className={`${darkMode(["menu"], dark)}`}>
                        <div className={darkMode(["user"], dark)}>
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
                                <div className="div w-[500px] h-[500px] bg-gray-500" style={{"opacity": "0.0"}} id="drop">
                                    <input ref={refer} type="file" max={1} min={1} accept="image/*" id="profile-input" hidden></input>
                                        <div className="flex flex-col w-[100%] h-[100%] align-center">
                                            <div className="my-auto"></div>
                                                <div className="flex flex-row justify-center">
                                                    <h1 className="block">{alt}</h1>
                                                </div>
                                                <div className="my-auto">
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    <img src={auth.currentUser?.emailVerified ? user : GeneralUser} alt="logo" />
                                    </div>
                                    <div className="flex flex-col text-center mt-2 name">
                                        <h1>{name}</h1>
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
        <>
            <button className="button mx-auto" onClick={() => auth.signOut()}>LogOut</button>
            <button className="button mx-auto" onClick={() => deleteAcc(true)}>Delete User</button>
        </>
    );
}

function DeletAccount(props: {auth: Auth}) {
    const {auth} = props;

    return (
        <>
        </>
    )
}