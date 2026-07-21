import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      // Alias workspace packages to their source so vitest can resolve them
      // without needing a build step
      "@workspace/db": new URL("../../lib/db/src/index.ts", import.meta.url).pathname,
      "@workspace/api-zod": new URL("../../lib/api-zod/src/index.ts", import.meta.url).pathname,
    },
  },
});
