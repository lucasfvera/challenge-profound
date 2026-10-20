import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // The derivation layer is pure and has no DOM; the component specs render
    // real components, so the suite runs in a DOM.
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Wide enough that a spec is collected rather than silently skipped.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
