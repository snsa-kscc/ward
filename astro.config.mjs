import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: [".ngrok-free.app"],
    },
  },
  integrations: [react()],
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
