import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { mockApiPlugin } from "./vite-plugin-mock-api";

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
