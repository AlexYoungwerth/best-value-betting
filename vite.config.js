import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [".trycloudflare.com"],
    proxy: {
      "/api/odds": {
        target: "https://api.the-odds-api.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/odds/, "")
      },
      "/api/polymarket": {
        target: "https://gamma-api.polymarket.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/polymarket/, "")
      }
    }
  }
});
