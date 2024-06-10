import { fetch } from "@tauri-apps/plugin-http";
import { Auth, User } from ".";
import { invoke } from "@tauri-apps/api/core";
import { clientId, scopes } from "../app/server";
import Toast from "../app/resources/api/toast";
import { login } from "./login";

interface DeviceCode {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface Value {
  access_token?: string;
}

export async function startLogin(auth: Auth) {
  const val: DeviceCode = await fetch(
    `https://github.com/login/device/code?client_id=${clientId}&scope=${scopes}`,
    {
      headers: {
        Accept: "application/json",
      },
      method: "POST",
    },
  ).then((r) => r.json());

  const t = Toast(`Opened ${val.verification_uri}`, "success", "never");
  const v = Toast(`Enter code: ${val.user_code}`, "warn", "never");
  invoke("open", {
    url: val.verification_uri,
  });

  let not_done = 0;

  const time = setInterval(async () => {
    console.log("Request");
    const response: Value = await fetch(
      `https://github.com/login/oauth/access_token?client_id=${clientId}&device_code=${val.device_code}&grant_type=urn:ietf:params:oauth:grant-type:device_code`,
      {
        headers: {
          Accept: "application/json",
        },
        method: "POST",
      },
    ).then((r) => r.json());

    not_done += 1;

    console.log(response, response.access_token != undefined);
    if (response?.access_token != undefined) {
      clearInterval(time);
      if (await login(auth, response.access_token)) {
        Toast("Logged in", "success", 1);
      } else {
        Toast("Failed to Log in", "danger", 1);
      }
      t?.unmount();
      v?.unmount();
    }

    if (not_done >= 10) {
      t?.unmount();
      v?.unmount();
      Toast("Failed to login: Timed Out", "danger", 2000);
      clearInterval(time);
    }
  }, 6000);
}
