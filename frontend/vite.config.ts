import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import stdLibBrowser from "vite-plugin-node-stdlib-browser";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), stdLibBrowser()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  publicDir: "public",
  resolve: {
    alias: {
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      buffer: "buffer",
      process: "process/browser",
    },
  },
  optimizeDeps: {
    include: ["crypto-browserify", "stream-browserify", "buffer", "process"],
  },
  define: {
    "process.env": {},
    global: "globalThis",
  },
});
