import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
const port = Number(process.env.PORT ?? "3000");
const basePath = process.env.BASE_PATH ?? "/";
const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  base: basePath,
  define: {
    __SQUARE_APP_ID__: JSON.stringify(process.env.SQUARE_APP_ID ?? ""),
    __SQUARE_LOCATION_ID__: JSON.stringify(process.env.SQUARE_LOCATION_ID ?? ""),
    __SQUARE_ENVIRONMENT__: JSON.stringify(process.env.SQUARE_ENVIRONMENT ?? "sandbox"),
  },
  plugins: [
    react(),
    tailwindcss(),
    ...(isDev && process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-runtime-error-modal").then((m) =>
            m.default(),
          ),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "router": ["wouter"],
          "query": ["@tanstack/react-query"],
          "ui-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-tabs",
            "@radix-ui/react-accordion",
            "@radix-ui/react-popover",
            "@radix-ui/react-label",
            "@radix-ui/react-slot",
          ],
          "motion": ["framer-motion"],
          "icons": ["lucide-react", "react-icons"],
        },
      },
    },
  },
  server: {
    port,
    strictPort: false,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
