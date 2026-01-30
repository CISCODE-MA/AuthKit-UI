import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ciscode-model",
      fileName: "index",
      formats: ["es", "umd"],
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
        "@ciscode/ui-translate-core",
        "lucide-react",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-router": "ReactRouter",
          "react-router-dom": "ReactRouterDOM",
          "react-cookie": "ReactCookie",
          axios: "axios",
          "jwt-decode": "jwt_decode",
          "@ciscode/ui-translate-core": "CISCODETranslateCore",
          "lucide-react": "LucideReact",
        },
      },
    },
  },
});