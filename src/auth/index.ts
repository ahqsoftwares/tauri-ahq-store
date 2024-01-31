import { Body, ResponseType, fetch } from "@tauri-apps/api/http";
import { newServer } from "../app/server";
import { invoke } from "@tauri-apps/api/tauri";

export interface Auth {
  loggedIn: boolean,
  onAuthChange: ((auth?: User) => void)[],
  currentUser?: User,
}

export interface User {
  email: string,
  e_verified?: boolean,
  u_id: number,
  display_name?: string,
  pfp?: string,
  dev: boolean;
}

export function genAuth(): Auth {
  return {
    loggedIn: false,
    onAuthChange: [],
  }
}

export function logOut(auth: Auth) {
  auth.loggedIn = false;
  auth.currentUser = undefined;
  auth.onAuthChange.forEach(cb => cb(undefined));
}

export interface UpdateVal {
  pass_word?: string;
  display_name?: string;
  pf_pic?: string;
  dev?: boolean;
}

export async function updateProfile(user: Auth, data: UpdateVal): Promise<[boolean, string]> {
  const pass = localStorage.getItem("password") || "[]";
  const passDe = await invoke<string>("decrypt", {
    encrypted: JSON.parse(pass),
  });

  const { ok, data: reason } = await fetch<string>(`${newServer}/users/@me`, {
    responseType: ResponseType.Text,
    method: "PATCH",
    headers: {
      uid: user.currentUser?.u_id,
      pass: passDe,
    },
    body: Body.json(data)
  });

  return [ok, reason]
}

export async function deleteAcc(user: User) {
  const pass = localStorage.getItem("password") || "[]";
  const passDe = await invoke<string>("decrypt", {
    encrypted: JSON.parse(pass),
  });

  const { ok } = await fetch(`${newServer}/users/@me`, {
    method: "DELETE",
    headers: {
      uid: user.email,
      pass: passDe,
    }
  });
  return ok;
}