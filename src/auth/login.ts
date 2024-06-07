import { fetch } from "@tauri-apps/plugin-http";
import { Auth, User } from ".";
import { invoke } from "@tauri-apps/api/core";

export function onAuthChange(auth: Auth, callback: (auth?: User) => void) {
  auth.onAuthChange.push(callback);
}

export async function tryAutoLogin(auth: Auth) {
  const token = JSON.parse(localStorage.getItem("token") || "[]") as number[];

  const auth_tok = await invoke<string>("decrypt", {
    encrypted: token,
  }).catch(() => "");

  await login(auth, auth_tok);
}

export async function login(
  auth: Auth,
  auth_tok: string,
): Promise<boolean> {
  const { ok, data } = await fetch(`https://api.github.com/user`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${auth_tok}`
    },
    connectTimeout: 100_000,
  }).then(async (d) => ({ ...d, ok: d.ok, data: await d.json() }));

  if (ok) {
    auth.currentUser = data;
    auth.loggedIn = true;

    invoke("encrypt", {
      payload: auth_tok
    }).then((d) => localStorage.setItem("token", JSON.stringify(d)));

    auth.onAuthChange.forEach((cb) => cb(data));
  } else {
    auth.onAuthChange.forEach((cb) => cb(undefined));
  }

  return ok;
}