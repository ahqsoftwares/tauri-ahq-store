const root = () => window.location.pathname = "/home";
const discord = () => window.open("https://discord.gg/wmEm7DNwwj", "_blank");

const rURL = "https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases/latest";

const getDownloadUrl = async() => {
    return await fetch(rURL)
    .then(res => res.json())
    .then(data => data.assets)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((assets: any[]) => assets.filter(({ name }: any) => name.endsWith(".msi") || name == "ahqstore_setup_x86_64.exe"))
}

export {
    root,
    discord,
    getDownloadUrl
}