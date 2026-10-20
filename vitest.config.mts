import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // The derivation layer is pure and has no DOM. A component spec will need
    // a DOM environment, which arrives with the first component test.
    environment: "node",
    // Wide enough that a spec is collected rather than silently skipped.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
