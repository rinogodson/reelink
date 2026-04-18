import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  // Completely removed 'site' and 'trailingSlash' to break the Cloudflare proxy loop
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
