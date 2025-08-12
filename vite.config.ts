import path from 'path'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [react()],
  server: { port: 5173, open: false },
});
