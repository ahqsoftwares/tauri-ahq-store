
import { defineConfig } from '@rsbuild/core';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginReact } from "@rsbuild/plugin-react";

import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';

export default defineConfig({
  plugins: [
    pluginReact({
      splitChunks: {
        react: true,
        router: true
      }
    }),
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
      babelLoaderOptions(opts) {
        opts.plugins?.unshift('babel-plugin-react-compiler');
      },
    }),
    pluginSvgr()
  ],
  html: {
    template: './index.html',
  },
  source: {
    entry: {
      index: './src/index.tsx',
    },
    alias: {
      "@": "./src",
      "@lib": "./src/app/resources",
      "@/*": "./src/*"
    }
  },
  output: {
    distPath: {
      root: "build"
    },
    minify: {
      css: true,
      js: true
    }
  },
  dev: {
    progressBar: false,
    hmr: true,
    watchFiles: {
      paths: ["./index.html", "./src/**/*"]
    }
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  tools: {
    rspack(_, { isDev, appendPlugins }) {
      if (isDev) {
        appendPlugins([
          new RsdoctorRspackPlugin({
            disableTOSUpload: true,
            port: 5000
          })
        ]);
      }
    }
  }
});