import { fetch } from "@tauri-apps/plugin-http";
import { Auth } from ".";
import { server } from "../app/server";

export interface SignupData {
  email: string;
  pass_word: string;
}

export async function signUp(
  auth: Auth,
  data: SignupData,
): Promise<[boolean, string]> {
  if (auth.loggedIn) {
    return [false, "Already logged in"];
  }

  const { ok, data: resp } = await fetch(`${server}/users/new`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  }).then(async (r) => ({ ...r, data: await r.json() }));

  return [ok, resp];
}
