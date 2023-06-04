const { hashSync } = require("bcrypt");
const { writeFileSync } = require("fs");
writeFileSync("./src-tauri/src/encrypt", `"${process.env.KEY}"`);
writeFileSync("./src-service/src/auth/encrypt", `"${process.env.KEY}"`);
writeFileSync("./src-service/src/auth/hash", `"${hashSync(process.env.KEY, 10)}"`);