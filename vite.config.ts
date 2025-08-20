// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { port: 5173, open: false },
  envDir: process.cwd(), // 🔑 Env dosyalarını proje kökünden yükle
  envPrefix: ["VITE_"], // 🔑 Sadece VITE_ ile başlayanları expose et
});
