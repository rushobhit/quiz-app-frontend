import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = "http://localhost:8080";

export default defineConfig({
  plugins: [react()],

  // Needed for GitHub Pages: repo name here
  base: "/quiz-app-frontend/",

  // Dev server settings (only used by `npm run dev`)
  server: {
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});