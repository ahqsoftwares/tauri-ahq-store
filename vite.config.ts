import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import path, { normalize } from "path";

export default defineConfig(({ mode }) => ({
  build: {
    outDir: "build",
    minify: "terser",
    cssMinify: true,
    sourcemap: mode === "development" || "hidden",
    rollupOptions: {
      maxParallelFileOps: 1,
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules") || id.includes("src-tauri")) {
            return "vendor";
          }
        },
        sourcemapIgnoreList: (relativeSourcePath) => {
          const path = normalize(relativeSourcePath);
          return path.includes("node_modules") || path.includes("src-tauri");
        },
        cache: true,
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    watched: {
      ignored: "**/src-*/**",
    },
  },
  plugins: [
    reactRefresh({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    svgrPlugin({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
