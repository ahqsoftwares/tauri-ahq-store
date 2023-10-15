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
      logo: {
        src: "./src/assets/logo.png",
        replacesTitle: true,
      },
      social: {
        github: "https://github.com/withastro/starlight",
      },
      sidebar: [
        {
          label: "Guides",
          autogenerate: {
            directory: "guides",
          },
        },
        {
          label: "API",
          badge: {
            text: "Experimental",
            variant: "caution",
          },
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
