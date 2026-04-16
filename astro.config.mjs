import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  vite: {
    optimizeDeps: {
      exclude: ["better-auth"],
    },
    ssr: {
      external: ["node:async_hooks", "node:events", "node:util"],
    },
  },
});
