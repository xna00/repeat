import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { svgDts } from "./svg";
import svgr from "vite-plugin-svgr";
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: "**/*.svg",
    }),
    svgDts(),
  ],
  server: {
    port: 6001,
    proxy: {
      "/api": {
        target: "https://localhost:3001",
        secure: false,
      },
    },
  },
});
