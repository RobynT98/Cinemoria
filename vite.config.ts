// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ✅ Viktigt för GitHub Pages: ersätt "/Cinemoria/" med exakt repo-namn
const GHP_BASE = "/Cinemoria/";

export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  return {
    base: isBuild ? GHP_BASE : "/",
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"), // ← gör "@/..." till src/...
      },
    },
    build: {
      target: "es2020",
      sourcemap: true,
      outDir: "dist",
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      open: false,
    },
    preview: {
      port: 4173,
      open: false,
    },
  };
});