import { Auth } from ".";

export async function resetPwd(auth: Auth, email: string): Promise<boolean> {
  if (auth.loggedIn) {
    throw new Error("Already logged in");
  }
  return true;
}