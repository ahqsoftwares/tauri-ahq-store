import { writeFileSync, readFileSync } from "fs";

const path = "./src/content/docs/index.mdx";

const file = String(readFileSync(path));

fetch(
  "https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases/latest"
)
  .then((resp) => resp.json())
  .then(({ tag_name }) => tag_name)
  .then((version) => {
    writeFileSync(path, file.replace(/{ahqStoreVersion}/g, version));
  });
