import { mkdirSync, writeFileSync } from "fs";

const verifyPage = "dh=83790a0f96cc5927e34557ec683be10f6886e078";

mkdirSync("./build/.well-known");
writeFileSync("./build/.well-known/discord", verifyPage);