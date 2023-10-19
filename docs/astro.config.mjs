import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      favicon: "./src/assets/logo.png",
      title: "AHQ Store",
      customCss: ["./src/css/global.css"],
      locales: {
        "en-US": {
          label: "English",
          lang: "en",
        },
      },
      logo: {
        src: "./src/assets/logo.png",
        replacesTitle: true,
      },
      social: {
        github: "https://github.com/ahqstore",
        email: "mailto:ahqsecret@gmail.com",
        "x.com": "https://x.com/ahqsoftwares",
        reddit: "https://www.reddit.com/r/AHQ_Softwares",
        twitter: "https://twitter.com/ahqsoftwares",
        instagram: "https://www.instagram.com/theofficialahqsoftwares",
      },
      sidebar: [
        {
          label: "Guides",
          autogenerate: {
            directory: "guides",
          },
        },
        {
          label: "Developers",
          badge: {
            variant: "danger",
          },
          autogenerate: {
            directory: "reference",
          },
          collapsed: true,
        },
        {
          label: "Framework",
          autogenerate: {
            directory: "framework",
          },
          collapsed: true,
        },
      ],
    }),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
