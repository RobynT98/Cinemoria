// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Viktigt för GitHub Pages: ersätt "/Cinemoria/" med exakt repo-namn
// Om ditt repo heter nåt annat, ändra strängen nedan.
const GHP_BASE = "/Cinemoria/";

// Så här:
// - Dev (vite): base = "/"
// - Build/Prod (GitHub Pages): base = "/Cinemoria/"
export default defineConfig(({ command, mode }) => {
  const isBuild = command === "build";
  return {
    base: isBuild ? GHP_BASE : "/",
    plugins: [react()],
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