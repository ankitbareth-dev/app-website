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
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // Handle CORS headers if needed
            if (req.method === "OPTIONS") {
              res.writeHead(200, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
                "Access-Control-Allow-Headers":
                  "Content-Type, Authorization, login, password, api-key",
              });
              res.end();
              return;
            }
          });
        },
      },
    },
  },
});
