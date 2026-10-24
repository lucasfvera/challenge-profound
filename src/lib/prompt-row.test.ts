import { describe, expect, it } from "vitest";
import { PLATFORM_PARAM } from "@/lib/platform-scope";
import { findPrompt } from "@/lib/prompt-detail";
import { promptDetailHref, rowActivation } from "@/lib/prompt-row";
import type { RowPress } from "@/lib/prompt-row";
import { snapshot } from "@/lib/snapshot";
import { PLATFORMS } from "@/lib/snapshot/platforms";

/** The base the drill-down's URL is read against. */
const BASE_URL = "http://localhost";

/** The path the detail route answers on. */
const DETAIL_PATH = "/prompts/";

/** A key press with nothing held down and nothing repeating. */
function press(key: string, overrides: Partial<RowPress> = {}) {
  return { key, repeat: false, modified: false, ...overrides };
}

describe("the prompt row's drill-down", () => {
  it("opens the detail route of the Prompt it is given", () => {
    expect(promptDetailHref("p-01", "claude")).toBe(
      "/prompts/p-01?platform=claude",
    );
  });

  it("opens a route the Snapshot can answer", () => {
    for (const prompt of snapshot.prompts) {
      const url = new URL(
        promptDetailHref(prompt.id, PLATFORMS[0].id),
        BASE_URL,
      );

      expect(findPrompt(url.pathname.slice(DETAIL_PATH.length))).toBeDefined();
    }
  });

  it("carries the Platform the view was scoped to", () => {
    for (const platform of PLATFORMS) {
      const url = new URL(
        promptDetailHref("p-01", platform.id),
        BASE_URL,
      );

      expect(url.searchParams.get(PLATFORM_PARAM)).toBe(platform.id);
    }
  });
});

describe("the prompt row's activation", () => {
  it("activates the row with Enter and with Space", () => {
    expect(rowActivation(press("Enter"))).toBe("activate");
    expect(rowActivation(press(" "))).toBe("activate");
  });

  it("ignores a key that does not activate a row", () => {
    expect(rowActivation(press("a"))).toBe("ignore");
    expect(rowActivation(press("Tab"))).toBe("ignore");
  });

  it("keeps the browser's default off while the key is held down", () => {
    expect(rowActivation(press("Enter", { repeat: true }))).toBe("suppress");
    expect(rowActivation(press(" ", { repeat: true }))).toBe("suppress");
  });

  it("leaves a modified press to the browser", () => {
    expect(rowActivation(press("Enter", { modified: true }))).toBe("ignore");
    expect(rowActivation(press(" ", { modified: true }))).toBe("ignore");
  });
});
