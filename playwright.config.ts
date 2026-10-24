import { defineConfig, devices } from "@playwright/test";

/**
 * The Playwright harness: the smoke suite runs against the **production
 * bundle**, not against the dev server.
 *
 * The harness builds the app and serves the bundle itself, so the suite
 * proves what ships. A dev server would answer with a different rendering
 * path, so a green suite against it would say nothing about the build.
 *
 * The harness binds a port of its own, so it never answers with somebody
 * else's server and never fights the dev server for 3000. The suite
 * reaches it through `baseURL`, so no test carries a host or a port.
 */

/** The port the harness serves the production bundle on. */
const PORT = 3100;

/** The address the suite reaches the production bundle at. */
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  // The suite lives outside `src/`, which is the half of the seam that
  // keeps it out of the Vitest run: the Vitest config collects `src/**`
  // and excludes `e2e/**`.
  testDir: "./e2e",
  // One browser: the smoke suite proves the story, not a browser matrix.
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // The list reporter is the one that reads in a terminal; the HTML report
  // would only be an artefact nobody opens.
  reporter: [["list"]],
  // A test marked `.only` narrows the suite, and a smoke suite that
  // quietly ran one test would say nothing about the story.
  forbidOnly: true,
  use: {
    baseURL,
    // The trace is kept for the tests that fail, so a red suite can be
    // read instead of guessed at.
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: baseURL,
    // The harness always builds and serves its own bundle, so a green
    // suite is always a statement about the current tree. A server left
    // answering on the port is reported, never reused.
    reuseExistingServer: false,
    // The build is the slow part of the harness, so it gets room.
    timeout: 180_000,
  },
});
