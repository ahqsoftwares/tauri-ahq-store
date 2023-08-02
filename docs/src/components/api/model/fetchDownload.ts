export default async function getAppInstallerFile() {
  const { tag_name, assets } = await fetch(
    "https://api.github.com/repos/ahqsoftwares/tauri-ahq-store/releases/latest",
  )
    .then((data) => data.json())
    .catch(() => {
      throw new Error("Error Occured!");
    });

  return {
    tagName: tag_name,
    download_url: assets.filter(({ name }: { name: string }) => {
      return name.endsWith("_x86_64.exe");
    })[0].browser_download_url,
  };
}
