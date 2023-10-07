import { invoke } from "@tauri-apps/api";
import {
  FetchOptions,
  ResponseType,
  fetch as tauriFetch,
} from "@tauri-apps/api/http";

export default async function fetch<T = any>(
  url: string,
  config: FetchOptions | undefined,
) {
  const email = localStorage.getItem("email") as string;

  const pwd = await invoke("decrypt", {
    encrypted: JSON.parse(localStorage.getItem("password") || "[]") as number[],
  }).catch(() => "a");

  return await tauriFetch<T>(url, {
    responseType: ResponseType.JSON,
    ...(config || {}),
    method: config?.method || "GET",
    timeout: 100,
    headers: {
      "User-Agent": navigator.userAgent,
      uid: email,
      pwd,
      ...(config?.headers || {}),
    },
  });
}
