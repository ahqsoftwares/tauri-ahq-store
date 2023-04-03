export default async function getAppInstallerFile() {
  const { tag_name, assets } = await fetch(
    "https://api.github.com/repos/ahqalt/tauri-ahq-store/releases/latest"
  )
    .then((data) => data.json())
    .catch(() => {
      throw new Error("Error Occured!");
    });

  return {
    tagName: tag_name,
    download_url: assets.filter(({ name }: { name: string }) => {
      return name.endsWith(".msi");
    })[0].browser_download_url,
  };
}
