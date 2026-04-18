import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare(), // Swapped Vercel for Cloudflare
  vite: {
    optimizeDeps: {
      exclude: ["better-auth"],
    },
    trailingSlash: "never",
    ssr: {
      external: ["node:async_hooks", "node:events", "node:util"],
    },
    plugins: [tailwindcss()],
  },
});
