import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      favicon: "/favicon.png",
      title: "Download - AHQ Store",
      customCss: ["./src/css/global.css"],
      logo: {
        src: "./src/assets/logo.png",
        replacesTitle: true,
      },
      social: {
        github: "https://github.com/ahqsoftwares/tauri-ahq-store",
        twitter: "https://twitter.com/ahqsoftwares",
        discord: "https://discord.gg/a485NGvc4c",
        instagram: "https://www.reddit.com/r/AHQ_Softwares/"
      },
      sidebar: [
        {
          label: "Guides",
          items: [
            {
              label: "Example Guide",
              link: "/guides/v1/",
            },
          ],
        },
        {
          label: "Reference",
          autogenerate: {
            directory: "reference",
          },
        },
      ],
    }),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
