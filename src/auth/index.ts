
export interface Auth {
  loggedIn: boolean;
  onAuthChange: ((auth?: User) => void)[];
  currentUser?: User;
}

export interface User {
  email?: string;
  login: string;
  name?: string;
  avatar_url?: string;
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
