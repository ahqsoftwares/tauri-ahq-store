const { hashSync, genSaltSync } = require("bcrypt");
const { writeFileSync } = require("fs");

const cryptr = new (require("cryptr"))(process.env.KEY);

const key = eval(
  cryptr.decrypt(
    "70d05001b953a745b0f853c91e1abc88c385c3cc7f8291decf3fdfbc42b71f7c958aaa59583e93fee488349a54b5211a63287380fda659b92a7a760e18f64e900de485b3bac58d120c6842825ee464ab3dbff00d4a7e3bcd64f15297eb601a3c6ea4d8e9ad04116a5fcb6136686e4957259d7f4a03f279751cc0b2c2261a67d8f10969169b2792061bdc3b13915a0347c7035f78d3b43ff4fecac288bb7f9a50d21b3a805902f55bf7d423b4efd8b412e1790c2a36bcf9090a341b4f221f7e5c7a6fba9a1f497ef4250669a651dd262b293e761deaf365b9a935267a491dbfdaf6cad0536cac61d5e4e9feb5cacbf9bf2b2799e7968885db530722",
  ),
)();

const salt = genSaltSync(10);

writeFileSync("./src-tauri/src/encrypt", `"${key}"`);
writeFileSync("./src-service/src/auth/encrypt", `"${key}"`);
writeFileSync("./src-service/src/auth/hash", `"${hashSync(key, salt)}"`);
