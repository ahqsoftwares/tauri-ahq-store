import { writeFileSync } from "fs";

const verifyPage = "dh=83790a0f96cc5927e34557ec683be10f6886e078";

writeFileSync("./build/verify.txt", verifyPage);