import { Body, ResponseType, fetch } from "@tauri-apps/api/http";
import { Auth } from ".";
import { newServer } from "../app/server";

export interface SignupData {
  email: string;
  pass_word: string;
}

export async function signUp(auth: Auth, data: SignupData): Promise<[boolean, string]> {
  if (auth.loggedIn) {
    return [false, "Already logged in"];
  }

  const { ok, data: resp } = await fetch<string>(`${newServer}/users/new`, {
    responseType: ResponseType.Text,
    method: "POST",
    body: Body.json(data),
  });

  return [ok, resp];
}