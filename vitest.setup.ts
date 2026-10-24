import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// The suite does not run with Vitest's globals, so the cleanup between the
// specs is wired here: a spec that renders a surface must not leave it in
// the document for the next one, and must not leave a stubbed browser
// capability behind either.
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
