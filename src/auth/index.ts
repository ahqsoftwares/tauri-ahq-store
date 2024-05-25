import { fetch } from "@tauri-apps/plugin-http";
import { server } from "../app/server";
import { invoke } from "@tauri-apps/api/core";

export interface Auth {
  loggedIn: boolean;
  onAuthChange: ((auth?: User) => void)[];
  currentUser?: User;
}

export interface User {
  email: string;
  e_verified?: boolean;
  u_id: number;
  display_name?: string;
  pf_pic?: string;
  dev: boolean;
}

export function genAuth(): Auth {
  return {
    loggedIn: false,
    onAuthChange: [],
  };
}

export function logOut(auth: Auth) {
  auth.loggedIn = false;
  auth.currentUser = undefined;
  auth.onAuthChange.forEach((cb) => cb(undefined));
}

export interface UpdateVal {
  pass_word?: string;
  display_name?: string;
  pf_pic?: string;
  dev?: boolean;
}

export async function updateProfile(
  user: Auth,
  data: UpdateVal,
): Promise<[boolean, string]> {
  const pass = localStorage.getItem("password") || "[]";
  const passDe = await invoke<string>("decrypt", {
    encrypted: JSON.parse(pass),
  });

  console.log(data);

  const { ok, data: reason } = await fetch(`${server}/users/@me`, {
    method: "PATCH",
    headers: {
      uid: String(user.currentUser?.u_id),
      pass: String(passDe),
      "ngrok-skip-browser-warning": "true"
    },
    body: JSON.stringify(data),
  }).then(async (r) => ({ ...r, data: await r.text() }));

  console.log(ok, reason);

  if (ok) {
    if (data.display_name && user.currentUser) {
      user.currentUser.display_name = data.display_name;
    }
    if (data.pf_pic && user.currentUser) {
      user.currentUser.pf_pic = data.pf_pic;
    }
    if (data.dev && user.currentUser) {
      user.currentUser.dev = data.dev;
    }
  }

  return [ok, reason];
}

export async function deleteAcc(user: User) {
  const pass = localStorage.getItem("password") || "[]";
  const passDe = await invoke<string>("decrypt", {
    encrypted: JSON.parse(pass),
  });

  const { ok } = await fetch(`${server}/users/@me`, {
    method: "DELETE",
    headers: {
      uid: user.email,
      pass: passDe,
      "ngrok-skip-browser-warning": "true"
    },
  });
  return ok;
}
