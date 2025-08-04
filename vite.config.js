import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/odoo": {
        target: "http://3.109.255.36",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/odoo/, ""),
      },
    },
  },
});
