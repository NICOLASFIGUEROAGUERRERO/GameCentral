// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone"  // Railway usa Node, esto es lo correcto
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});