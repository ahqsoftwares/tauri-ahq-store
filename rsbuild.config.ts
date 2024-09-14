import { defineConfig } from "@rsbuild/core";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
      babelLoaderOptions(opts) {
        opts.plugins?.unshift("babel-plugin-react-compiler");
      },
    }),
    pluginSvgr(),
  ],
  html: {
    template: "./index.html",
  },
  source: {
    entry: {
      index: "./src/index.tsx",
    },
    alias: {
      "@": "./src",
      "@lib": "./src/app/resources",
      "@/*": "./src/*",
    },
  },
  output: {
    distPath: {
      root: "build",
    },
    minify: {
      css: true,
      js: true,
    },
  },
  dev: {
    progressBar: true,
    hmr: true,
    watchFiles: {
      paths: ["./index.html", "./src/**/*"],
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
