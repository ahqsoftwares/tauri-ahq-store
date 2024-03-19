/* eslint-disable react-hooks/exhaustive-deps */

/*
React && Native
*/
import { FormEventHandler, useEffect, useState } from "react";
import { sendNotification } from "@tauri-apps/api/notification";
import { Body, fetch } from "@tauri-apps/api/http";
import Toast from "../resources/api/toast";

/*
Firebase API
*/
import { Auth, User, deleteAcc, logOut, updateProfile } from "../../auth";

/*Icons
 */
import { BsPen, BsPenFill } from "react-icons/bs";

/*
Database Refs
*/
import { server } from "../server";
import GeneralUser from "./user.png";
import Loading from "./loading.gif";
import { BiLogOut, BiUserX } from "react-icons/bi";
import PopUp from "../resources/components/popup";
import { open } from "@tauri-apps/api/dialog";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { VscKey } from "react-icons/vsc";
import { invoke } from "@tauri-apps/api/tauri";
import { checkAuth } from "../../auth/login";

/*
Interfaces
*/
interface UserProps {
  auth: Auth;
  dark: boolean;
}

export default function Init(props: UserProps) {
  let { auth, dark } = props;

  let [backupUser, setBackup] = useState(""),
    [user, setUser] = useState(Loading),
    [name, setName] = useState(""),
    [alt, setAlt] = useState("Please wait..."),
    [showDelete, setDelete] = useState(false),
    [deletePwd, setPwd] = useState(""),
    [Pen, setPen] = useState(
      dark ? <BsPen size="2em" /> : <BsPenFill size="2em" />,
    ),
    [namePopup, setNamePopup] = useState(false),
    [passwordPopup, setpPopop] = useState(false),
    [profilePictureData, setPFD] = useState({});

  useEffect(() => {
    (async () => {
      if (!auth.currentUser?.e_verified) {
        setAlt("Verify email to upload");
        setUser(GeneralUser);
        setName("Guest");
      } else {
        if (auth.currentUser?.display_name) {
          setName(auth.currentUser?.display_name);
        } else {
          setName("Guest");
        }
        setUser(Loading);
        setUser(auth?.currentUser?.pfp || GeneralUser);
        setAlt(
          auth.currentUser?.pfp ? "Click to edit picture" : "Click to upload",
        );
      }
    })();
  }, [auth.currentUser]);

  useEffect(() => {
    const image = document.getElementById("img") as HTMLElement,
      drop = document.getElementById("drop") as HTMLElement;

    image.addEventListener("mouseover", () => {
      drop.setAttribute("style", "opacity: 0.9");
    });
    image.addEventListener("mouseleave", () => {
      drop.setAttribute("style", "opacity: 0.0");
    });
    image.addEventListener("click", async () => {
      if (auth.currentUser?.e_verified) {
        const image = await open({
          multiple: false,
          filters: [
            {
              name: "image",
              extensions: ["png"],
            },
          ],
        });

        if (image) {
          const data = await readBinaryFile(image as string);
          const blob = new Blob([data]);

          const fs = new FileReader();

          fs.readAsDataURL(blob);
          fs.onload = async () => {
            setBackup(user);
            setUser(Loading);

            setPFD({ fs });

            const password: string | false = await invoke<string>("decrypt", {
              encrypted: JSON.parse(localStorage.getItem("password") || "[]"),
            }).catch(() => false);

            if (password === false) {
              setpPopop(true);
            } else {
              checkAuth(
                auth?.currentUser?.u_id.toString() || "",
                password,
              )
                .then((ok) => {
                  if (!ok) {
                    return setpPopop(true);
                  } else {
                    return ChangeProfile(
                      auth,
                      setAlt,
                      setUser,
                      {
                        result: fs.result as string,
                      },
                      password,
                      setPFD,
                    );
                  }
                })
                .catch((_e) => {
                  setUser(backupUser);
                  sendNotification({
                    title: "Error",
                    body: "Server Error / Your account must be at least an hour old",
                  });
                  console.warn("The Server didn't respond");
                });
            }
          };
        }
      }
    });
  }, []);

  return (
    <>
      <PopUp shown={showDelete} width="30rem" height="40rem">
        <DeleteAccount
          auth={auth}
          cancel={() => {
            setDelete(false);
            setPwd("");
          }}
          pass={deletePwd}
          set={{ pwd: setPwd }}
          dark={props.dark}
        />
      </PopUp>

      <PopUp shown={passwordPopup}>
        <>
          <div className="w-[100%] flex flex-col justify-end text-end items-end">
            <button
              className={`block font-extrabold text-2xl ${
                dark ? "text-white" : "text-black"
              } hover:text-red-800`}
              style={{ transition: "all 250ms linear" }}
              onClick={() => {
                (
                  document.getElementById("accpwdhost") as HTMLInputElement
                ).value = "";
                setpPopop(false);
              }}
            >
              X
            </button>
          </div>
          <form
            className="w-[100%] h-[100%] flex flex-col text-center items-center justify-center"
            onSubmit={(event) => {
              event.preventDefault();
              const error = document.getElementById(
                "errorhost",
              ) as HTMLHeadingElement;
              const inputPassword = (
                document.getElementById("accpwdhost") as HTMLInputElement
              ).value;

              checkAuth(
                auth?.currentUser?.u_id.toString() as string,
                inputPassword,
              )
                .then(async (ok) => {
                  if (ok) {
                    const data: string | false = await invoke<string>(
                      "encrypt",
                      {
                        payload: inputPassword,
                      },
                    ).catch(() => false);

                    if (data !== false) {
                      localStorage.setItem("password", JSON.stringify(data));
                    }

                    setpPopop(false);

                    ChangeProfile(
                      auth,
                      setAlt,
                      setUser,
                      {
                        result: (profilePictureData as any).fs.result,
                      },
                      inputPassword,
                      setPFD,
                    );

                    error.innerText = "";
                    (
                      document.getElementById("accpwdhost") as HTMLInputElement
                    ).value = "";
                  } else {
                    error.innerText = "Wrong Password!";
                  }
                })
                .catch((e) => {
                  console.warn(e);
                  error.innerText = "Please try again later";
                });
            }}
          >
            {/*eslint-disable-next-line jsx-a11y/heading-has-content*/}
            <h1
              id="errorhost"
              className="text-red-700 text-3xl text-bolder pb-2"
            ></h1>
            <input
              id="accpwdhost"
              className="style-input style-input-d"
              type="password"
              placeholder="Enter Your Account Password"
            ></input>

            <button className="button">Submit</button>
          </form>
        </>
      </PopUp>

      <PopUp shown={namePopup} width="30rem" height="40rem">
        <ChangeAccountName
          close={() => setNamePopup(false)}
          user={auth.currentUser as User}
          auth={auth}
          updateName={(value: string) => setName(value)}
          dark={props.dark}
        />
      </PopUp>

      <div className="menu pb-2">
        <div className="user pb-2">
          {auth.currentUser?.e_verified ? (
            <></>
          ) : (
            <div className="flex flex-col text-center">
              <h1 style={{ color: "red", fontSize: "20px" }}>
                Unverified Email
              </h1>
            </div>
          )}
          <div className="img" id="img">
            <img
              src={auth.currentUser?.e_verified ? user : GeneralUser}
              alt="Avatar"
            />
            <div className={`div ${props.dark ? "" : "div-l"}`} id="drop">
              <h1 className="text">{alt}</h1>
            </div>
          </div>
          <div className="flex flex-col text-center mt-2 name">
            <div className="flex justify-center">
              <h1>{name}</h1>
              {auth.currentUser?.e_verified ? (
                <>
                  <div className="ml-[0.5rem]"></div>
                  <span
                    onMouseLeave={() => {
                      setPen(
                        dark ? <BsPen size="2em" /> : <BsPenFill size="2em" />,
                      );
                    }}
                    onMouseEnter={() => {
                      setPen(
                        dark ? <BsPenFill size="2em" /> : <BsPen size="2em" />,
                      );
                    }}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => setNamePopup(true)}
                  >
                    <div className={props.dark ? "text-gray-300" : ""}>
                      {Pen}
                    </div>
                  </span>
                </>
              ) : (
                <></>
              )}
            </div>
            <h6>{auth.currentUser?.email}</h6>
          </div>
        </div>
        <Actions auth={auth} deleteAcc={setDelete} />
      </div>
    </>
  );
}

function Actions(props: { auth: Auth; deleteAcc: Function }) {
  const { auth, deleteAcc } = props;
  return (
    <div className="flex flex-col">
      <div className="flex w-[100%] flex-row">
        <button
          className="mx-auto flex items-center text-center justify-center dui-btn"
          onClick={() => {
            localStorage.removeItem("password");
            logOut(auth);
          }}
          style={{
            minWidth: "15rem",
            maxWidth: "15rem",
            minHeight: "3.5rem",
            maxHeight: "3.5rem",
          }}
        >
          <BiLogOut size="2.5em" />
          <p className="mx-2">LogOut</p>
        </button>
        <div className="mx-3"></div>
        <button
          className="mx-auto flex items-center text-center justify-center dui-btn dui-btn-error"
          onClick={() => deleteAcc(true)}
          style={{
            minWidth: "15rem",
            maxWidth: "15rem",
            minHeight: "3.5rem",
            maxHeight: "3.5rem",
          }}
        >
          <BiUserX size="2.5em" />
          <p className="mx-2">Delete Account</p>
        </button>
      </div>
      <button
        onClick={() => {
          const toast = Toast("Please wait...", "warn", "never");
          function startUnmount() {
            setTimeout(() => {
              toast?.unmount();
            }, 5000);
          }

          /*sendPasswordResetEmail(
            auth as Auth,
            auth.currentUser?.email as string,
          )
            .then(() => {
              const email = auth.currentUser?.email as string;
              let censoredEmail = "";

              for (let i = 0; i < email.split("@")[0].length; i++) {
                let slice = email[i];

                if (i === 0) {
                  censoredEmail += slice;
                } else if (i === email.split("@")[0].length - 1) {
                  censoredEmail += slice;
                } else {
                  censoredEmail += "*";
                }
              }

              censoredEmail += `@${email.split("@")[1]}`;

              toast?.edit(
                `Password reset link sent to ${censoredEmail}`,
                "success",
              );
              startUnmount();
            })
            .catch(() => {
              toast?.edit("Failed to send Password reset email!", "danger");
              startUnmount();
            });*/
        }}
        className="dui-btn dui-btn-success mt-3 mx-auto flex items-center text-center justify-center"
        style={{
          minWidth: "100%",
          maxWidth: "100%",
          minHeight: "3.5rem",
          maxHeight: "3.5rem",
        }}
      >
        <VscKey size="2.5em" />
        <p className="mx-2 text-info-success">Reset Password</p>
      </button>
    </div>
  );
}

interface DeleteAccountProps {
  auth: Auth;
  cancel: Function;
  pass: string;
  dark: boolean;
  set: {
    pwd: Function;
  };
}

function DeleteAccount(props: DeleteAccountProps) {
  const { cancel, pass, set, auth, dark } = props;
  const { pwd: sP } = set;

  const user = auth.currentUser as User;
  let [text, setText] = useState("Delete My Account;-danger;false"),
    [step, setStep] = useState(0),
    [err, setErr] = useState("");

  function reverse(err: string) {
    setErr(err);
    setText("Delete My Account;-danger;false");
  }

  const ManageDelete: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setText(`⏲️;;true`);
    await checkAuth(auth.currentUser?.email || "", pass)
      .then((ok) => {
        if (ok) {
          reverse("");
          setStep(1);
        } else reverse("Invalid username/password");
      })
      .catch((e) => {
        let msg = e.message
          .replace("Firebase: Error ", "")
          .replace(")", "")
          .replace("(", "")
          .replaceAll(".", "");

        switch (msg) {
          case "auth/wrong-password":
            reverse("Wrong Password!");
            break;
          case "Firebase: Access to this account has been temporarily disabled due to many failed login attempts You can immediately restore it by resetting your password or you can try again later auth/too-many-requests":
            reverse("Too many login attempts!");
            break;
          default:
            reverse("Unknown Error!");
            break;
        }
      });
  };

  const ConfirmDelete: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const succ = await deleteAcc(auth.currentUser as User);
    if (!succ) {
      sendNotification({
        title: "Error",
        body: "Unable to delete account!",
      });
    }
    logOut(auth);
  };

  return (
    <div className="flex flex-col" style={{ transition: "all 250ms linear" }}>
      <div className="flex flex-row">
        <div className="mx-auto"></div>
        <button
          className={`${
            dark ? "text-white" : "text-black"
          } hover:text-red-500 h-[1rem] w-[1rem]`}
          style={{ fontWeight: "bolder", transition: "all 250ms linear" }}
          onClick={() => cancel()}
        >
          X
        </button>
      </div>

      <div className="mt-[8rem]"></div>

      <h2 className="text-center text-red-700" style={{ fontSize: "25px" }}>
        {err}
      </h2>

      <div className="mt-[2rem]"></div>

      <div className="flex flex-col">
        <form
          className="flex flex-col items-center"
          onSubmit={step === 0 ? ManageDelete : ConfirmDelete}
        >
          {step === 0 ? (
            <>
              <input
                className={`style-input ${!props.dark ? "" : "style-input-d"}`}
                disabled
                type="email"
                placeholder="Enter Your Email"
                value={String(user.email)}
                required
              ></input>

              <div className="mt-[1rem]"></div>

              <input
                className={`style-input ${!props.dark ? "" : "style-input-d"}`}
                type="password"
                placeholder="Enter Your Password"
                minLength={8}
                value={pass}
                onChange={(e) => sP(e.target.value)}
                required
                disabled={text.split(";")[2] === "true"}
              ></input>

              <div className="mt-[12.5rem]"></div>
              <button
                className={`button${
                  text.split(";")[1]
                } flex items-center text-center justify-center`}
                style={{ transition: "all 500ms linear" }}
                disabled={text.split(";")[2] === "true"}
              >
                {text.split(";")[0]}
              </button>
            </>
          ) : (
            <>
              <h1
                className={`text-3xl text-center ${
                  dark ? "text-slate-200" : ""
                }`}
              >
                Are you sure you want to delete your account?
              </h1>
              <div className="mt-[14rem]"></div>
              <div className="flex">
                <div className="w-[10rem] ml-[4rem]"></div>
                <div className="w-[12rem]">
                  <button
                    type="reset"
                    className="button button-success flex items-center text-center justify-center"
                    onClick={() => cancel()}
                  >
                    <h1 className="block text-bold">NO</h1>
                  </button>
                </div>
                <div className="w-[12rem]">
                  <button className="button-danger flex items-center text-center justify-center">
                    <h1 className="block text-bold">YES</h1>
                  </button>
                </div>
                <div className="w-[10rem]"></div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

interface AccountNameProps {
  close: Function;
  user: User;
  auth: Auth;
  updateName: Function;
  dark: boolean;
}
function ChangeAccountName(props: AccountNameProps) {
  const { close, dark, user, auth, updateName } = props;
  const name = user.display_name as string;

  let [value, setValue] = useState(name);

  async function confirmName(e: { preventDefault: Function }) {
    close();
    e.preventDefault();
    try {
      if (user.display_name !== value) {
        await updateProfile(auth, {
          display_name: value,
        });
      }
      updateName(value);
      setValue("");
    } catch (e) {
      sendNotification({ title: "Error", body: "Could not set name" });
    }
  }

  return (
    <div className="flex flex-col" style={{ transition: "all 250ms linear" }}>
      <div className="flex flex-row">
        <div className="mx-auto"></div>
        <button
          className={`${
            dark ? "text-white" : "text-black"
          } hover:text-red-500 h-[1rem] w-[1rem]`}
          style={{ fontWeight: "bolder", transition: "all 250ms linear" }}
          onClick={() => close()}
        >
          X
        </button>
      </div>

      <div className="mt-[10rem]"></div>

      <div className="flex flex-col">
        <form className="flex flex-col items-center" onSubmit={confirmName}>
          <input
            className={`style-input ${!props.dark ? "" : "style-input-d"}`}
            type="string"
            placeholder="Enter Name for Profile"
            maxLength={32}
            minLength={6}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          ></input>

          <div className="mt-[15rem]"></div>

          <button
            className={`button`}
            style={{ transition: "all 500ms linear" }}
          >
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}

async function ChangeProfile(
  auth: Auth,
  setAlt: Function,
  setUser: Function,
  fs: { result: string },
  pwd: string,
  setPFD: ({}) => void,
) {
  try {
    setUser(Loading);
    setAlt("Please Wait...");

    updateProfile(auth, {
      pf_pic: fs.result
    }).then(([ok, reason]) => {
      if (!ok) {
        sendNotification({
          title: "Failed to update profile picture!",
          body: reason
        });
        setPFD({});

        setUser(auth?.currentUser?.pfp || GeneralUser);
      } else {
        setAlt("Click to edit picture");
        setUser(fs.result);
        setPFD({});
      }
    });
  } catch (e) {
    console.error(e);
    setUser(GeneralUser);
    sendNotification("Failed to update profile picture!");
    setPFD({});
  }
}
