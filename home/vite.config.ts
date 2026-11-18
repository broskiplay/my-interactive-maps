import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Главная собирается в /assets/home/ (хэши в именах файлов), а HTML пререндерится в /index.html — см. home/prerender.mjs.
// Сервер разработки: npm run dev (страницы карт и данные берутся из корня репозитория через publicDir).
const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root,
  base: "/assets/home/",
  publicDir: false,
  plugins: [react()],
  css: { postcss: root },
  build: {
    outDir: "../assets/home",
    assetsDir: "",
    emptyOutDir: true,
    manifest: false,
    target: "es2019",
  },
  server: { fs: { allow: [".."] } },
});
