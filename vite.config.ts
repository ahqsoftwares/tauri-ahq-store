import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-swc'
import svgrPlugin from 'vite-plugin-svgr'


export default defineConfig({
  build: {
    outDir: 'build',
    minify: "terser",
    cssMinify: true
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  plugins: [
    reactRefresh(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
})