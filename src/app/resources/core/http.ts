import { invoke } from "@tauri-apps/api/core";
import {
  ClientOptions,
  fetch as tauriFetch,
} from "@tauri-apps/plugin-http";

export default async function fetch(
  url: string,
  config: (RequestInit & ClientOptions) | undefined,
) {
  const email = localStorage.getItem("email") as string;

  const pwd = await invoke<string>("decrypt", {
    encrypted: JSON.parse(localStorage.getItem("password") || "[]") as number[],
  }).catch(() => "a");

  return await tauriFetch(url, {
    ...(config || {}),
    method: config?.method || "GET",
    connectTimeout: 100_000,
    headers: {
      "User-Agent": navigator.userAgent,
      uid: email,
      pwd,
      ...(config?.headers || {}),
    },
  }).then(async (data) => ({
    ...data, data: await data.text().then((val) => {
      try {
        return JSON.parse(val);
      } catch (_) {
        return val;
      }
    })
  }));
}
