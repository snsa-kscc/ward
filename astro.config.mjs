import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import postcss from "postcss";
import clampwind from "postcss-clampwind";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
