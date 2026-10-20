import { describe, expect, it } from "vitest";
import { isPlatformId, resolvePlatformId } from "@/lib/platform-scope";
import { snapshot } from "@/lib/snapshot";

/** A value the Snapshot does not track: an assistant outside the four. */
const UNKNOWN_PLATFORM = "gpt-4";

describe("the platform scope", () => {
  it("resolves every Platform the Snapshot tracks", () => {
    for (const platform of snapshot.platforms) {
      expect(resolvePlatformId(platform.id)).toBe(platform.id);
    }
  });

  it("falls back to ChatGPT for a value it cannot use", () => {
    expect(resolvePlatformId(UNKNOWN_PLATFORM)).toBe("chatgpt");
    expect(resolvePlatformId("")).toBe("chatgpt");
    expect(resolvePlatformId(null)).toBe("chatgpt");
    expect(resolvePlatformId(undefined)).toBe("chatgpt");
    expect(resolvePlatformId(["claude", "gemini"])).toBe("chatgpt");
  });

  it("tells a tracked Platform from an unknown one", () => {
    expect(isPlatformId("perplexity")).toBe(true);
    expect(isPlatformId(UNKNOWN_PLATFORM)).toBe(false);
    expect(isPlatformId(undefined)).toBe(false);
  });
});
