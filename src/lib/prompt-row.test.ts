import { describe, expect, it } from "vitest";
import { PLATFORM_PARAM } from "@/lib/platform-scope";
import { isRowActivation, promptDetailHref } from "@/lib/prompt-row";
import type { RowActivation } from "@/lib/prompt-row";
import { snapshot } from "@/lib/snapshot";
import { PLATFORMS } from "@/lib/snapshot/platforms";

/** The Prompt the drill-down is opened for. */
const PROMPT_ID = "p-01";

/** The base the drill-down's URL is read against. */
const BASE_URL = "http://localhost";

/** A key press with nothing held down and nothing repeating. */
function press(key: string, overrides: Partial<RowActivation> = {}) {
  return { key, repeat: false, modified: false, ...overrides };
}

describe("the prompt row's drill-down", () => {
  it("opens the detail route of the Prompt it is given", () => {
    expect(promptDetailHref("p-01", "claude")).toBe(
      "/prompts/p-01?platform=claude",
    );
  });

  it("names the route of every tracked Prompt", () => {
    for (const prompt of snapshot.prompts) {
      const url = new URL(
        promptDetailHref(prompt.id, "chatgpt"),
        BASE_URL,
      );

      expect(url.pathname).toBe(`/prompts/${prompt.id}`);
    }
  });

  it("carries the Platform the view was scoped to", () => {
    for (const platform of PLATFORMS) {
      const url = new URL(
        promptDetailHref(PROMPT_ID, platform.id),
        BASE_URL,
      );

      expect(url.searchParams.get(PLATFORM_PARAM)).toBe(platform.id);
    }
  });
});

describe("the prompt row's activation", () => {
  it("activates the row with Enter and with Space", () => {
    expect(isRowActivation(press("Enter"))).toBe(true);
    expect(isRowActivation(press(" "))).toBe(true);
  });

  it("ignores a key that does not activate a row", () => {
    expect(isRowActivation(press("a"))).toBe(false);
    expect(isRowActivation(press("Tab"))).toBe(false);
  });

  it("does not activate the row again while the key is held down", () => {
    expect(isRowActivation(press(" ", { repeat: true }))).toBe(false);
  });

  it("leaves a modified press to the browser", () => {
    expect(isRowActivation(press(" ", { modified: true }))).toBe(false);
  });
});
