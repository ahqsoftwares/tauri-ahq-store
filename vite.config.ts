import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-swc";
import svgrPlugin from "vite-plugin-svgr";
import { cpus } from "os";
import { normalize } from "path";

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
        cache: true
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    watched: {
      ignored: "**/target/**"
    }
  },
  plugins: [
    reactRefresh(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
}));
