import { ClientOptions, fetch as tauriFetch } from "@tauri-apps/plugin-http";

export default async function fetch(
  url: string,
  config: (RequestInit & ClientOptions) | undefined,
  mutate = true,
) {
  return await tauriFetch(url, {
    ...(config || {}),
    method: config?.method || "GET",
    connectTimeout: 100_000,
    headers: {
      "User-Agent": navigator.userAgent,
      "ngrok-skip-browser-warning": "true",
      ...(config?.headers || {}),
    },
  }).then(async (data) => {
    if (mutate) {
      return {
        ...data,
        resp: data,
        data: await data.text().then((val) => {
          try {
            return JSON.parse(val);
          } catch (_) {
            return val;
          }
        }),
      };
    } else {
      return { ...data, resp: data, data: "" };
    }
  });
}
