
import { ResponseType, fetch } from "@tauri-apps/api/http";
import { newServer } from "../app/server";
import { Auth, User } from ".";

export function onAuthChange(auth: Auth, callback: (auth?: User) => void) {
  auth.onAuthChange.push(callback);
}

export async function login(auth: Auth, email: string, password: string): Promise<boolean> {
  const { ok, data } = await fetch<User>(`${newServer}/users/@me`, {
    method: "GET",
    responseType: ResponseType.JSON,
    headers: {
      uid: email,
      pass: password
    }
  });

  if (ok) {
    auth.currentUser = data;
    auth.onAuthChange.forEach(cb => cb(data));
  }

  return ok;
}

export async function checkAuth(email: string, password: string): Promise<boolean> {
  const { ok } = await fetch<User>(`${newServer}/users/@me`, {
    method: "GET",
    responseType: ResponseType.JSON,
    headers: {
      uid: email,
      pass: password
    }
  });

  return ok;
}