import { get_sha, sha } from "@/app/resources/core";
import { invoke } from "@tauri-apps/api/core";
import { get_dev_data } from "src-ahqstore-types/pkg/ahqstore_types";

export async function generateGHUserHash(username: string): Promise<string> {
  await get_sha();
  if (username == "ahqsoftwares") return "1";

  const hash = await invoke<string>("hash_username", { username });

  console.log("Hash: ", hash);
  return hash;
}

export async function verifyDevExists(hash: string) {
  const resp = await get_dev_data(sha, hash).catch(() => undefined);

  console.log("Resp: ", resp, resp != undefined);
  return resp != undefined;
}
