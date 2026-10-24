import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

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
    // The end-to-end suite runs on Playwright, not on Vitest, and it lives
    // outside `src/`. The exclusion states the other half of that seam, so
    // widening the include above can never collect a Playwright spec.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
