import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  i18n: {
    defaultLocale: "en",
    locales: ["es", "en", "fr"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
  ],
  output: "server",
  adapter: node({
    mode: "middleware",
  }),
  experimental: {
    actions: true,
  },
});
