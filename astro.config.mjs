import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  vite: {
    optimizeDeps: {
      exclude: ["better-auth"],
    },

    ssr: {
      external: ["node:async_hooks", "node:events", "node:util"],
    },

    plugins: [tailwindcss()],
  },
});