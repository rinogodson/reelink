import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "server",
  adapter: vercel(),
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
