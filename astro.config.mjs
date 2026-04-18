import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://reelink.rinogodson.workers.dev", // Anchors your exact domain!
  output: "server",
  adapter: cloudflare(),
  trailingSlash: "ignore", // Safely moved out of vite, prevents Cloudflare conflicts

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
