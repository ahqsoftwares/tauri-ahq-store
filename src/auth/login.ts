import { ResponseType, fetch } from "@tauri-apps/api/http";
import { newServer } from "../app/server";
import { Auth, User } from ".";
import { invoke } from "@tauri-apps/api/tauri";

export function onAuthChange(auth: Auth, callback: (auth?: User) => void) {
  auth.onAuthChange.push(callback);
}

export async function tryAutoLogin(auth: Auth) {
  const [email, pwd] = [
    localStorage.getItem("email") || "",
    JSON.parse(localStorage.getItem("password") || "[]") as number[],
  ];

  const pass = await invoke<string>("decrypt", {
    encrypted: pwd,
  }).catch(() => "");

  await login(auth, email, pass);
}

export async function login(
  auth: Auth,
  email: string,
  password: string,
): Promise<boolean> {
  const { ok, data } = await fetch<User>(`${newServer}/users/@me`, {
    method: "GET",
    responseType: ResponseType.JSON,
    headers: {
      uid: email,
      pass: password,
    },
    timeout: 10
  });

  if (ok) {
    auth.currentUser = data;
    auth.loggedIn = true;

    auth.onAuthChange.forEach((cb) => cb(data));
  } else {
    auth.onAuthChange.forEach((cb) => cb(undefined));
  }

  return ok;
}

export async function checkAuth(
  email: string,
  password: string,
): Promise<boolean> {
  const { ok } = await fetch<User>(`${newServer}/users/@me`, {
    method: "GET",
    responseType: ResponseType.JSON,
    headers: {
      uid: email,
      pass: password,
    },
  });

  return ok;
}
