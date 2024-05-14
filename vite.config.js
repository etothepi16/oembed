import { defineConfig } from "vite"

export default defineConfig({
  base: "/.",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        page1: "page1.html",
        page2: "page2.html",
        page3: "page3.html",
      },
    },
  },
})
