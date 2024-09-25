import { fetchAuthor } from "@/app/resources/api/fetchApps";
import { get_sha } from "@/app/resources/core";
import { invoke } from "@tauri-apps/api/core";

export async function generateGHUserHash(username: string): Promise<string> {
  await get_sha();
  if (username == "ahqsoftwares") return "1";

  const hash = await invoke<string>("hash_username", { username });

  return hash;
}

export async function verifyDevExists(hash: string) {
  const resp = await fetchAuthor(hash).catch(() => undefined);

  return resp != undefined;
}
