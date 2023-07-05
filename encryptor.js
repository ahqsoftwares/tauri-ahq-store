const { hashSync } = require("bcrypt");
const { writeFileSync } = require("fs");

const cryptr = new (require("cryptr"))(process.env.KEY);

const key = eval(
  cryptr.decrypt(
    "9c10c6984b1d28ff863ea20af235215b005cc5efcd90551ab357f54baeec364d99fb05b35fe8fb9f4c631e94b04a29092a76800439be75909eaa23d54ad56f980023fb64841eb8f36e2d96965417a453f917860efd48bf1d517f78fcea87a16add1925231054b49bb895bd5b7320e0efaa5d80e92e3c845635994c22ddf8edd1f9854bb66edffbaced8817303f38b0005bd7b9b40b70a32737b8981866e277332ac5f0e27129902ffc1b41f45657c495daeb06f1ad6c9be0b8fe68d44f1c148498c3796d845fb72a0871993fe9d2fecd2789fb69b27d400d82f14b"
  )
);

writeFileSync("./src-tauri/src/encrypt", `"${key}"`);
writeFileSync("./src-service/src/auth/encrypt", `"${key}"`);
writeFileSync("./src-service/src/auth/hash", `"${hashSync(key, 10)}"`);
