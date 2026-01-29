import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ciscode-model",
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react-router",
        "react-router-dom",
        "react-cookie",
        "axios",
        "jwt-decode",
        "@ciscode/ui-translate-core"
      ],
    },
  },
});