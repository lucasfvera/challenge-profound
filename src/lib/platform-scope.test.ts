import { describe, expect, it } from "vitest";
import {
  isPlatformId,
  platformScopeHref,
  resolvePlatform,
} from "@/lib/platform-scope";
import { PLATFORMS } from "@/lib/snapshot/platforms";

/** A value the Snapshot does not track: an assistant outside the four. */
const UNKNOWN_PLATFORM = "gpt-4";

describe("the platform scope", () => {
  it("resolves every Platform the Snapshot tracks", () => {
    for (const platform of PLATFORMS) {
      expect(resolvePlatform(platform.id).id).toBe(platform.id);
      expect(resolvePlatform(platform.id).name).toBe(platform.name);
    }
  });

  it("falls back to ChatGPT for a value it cannot use", () => {
    expect(resolvePlatform(UNKNOWN_PLATFORM).id).toBe("chatgpt");
    expect(resolvePlatform("").id).toBe("chatgpt");
    expect(resolvePlatform(null).id).toBe("chatgpt");
    expect(resolvePlatform(undefined).id).toBe("chatgpt");
    expect(resolvePlatform(["claude", "gemini"]).id).toBe("chatgpt");
  });

  it("tells a tracked Platform from an unknown one", () => {
    expect(isPlatformId("perplexity")).toBe(true);
    expect(isPlatformId(UNKNOWN_PLATFORM)).toBe(false);
    expect(isPlatformId(undefined)).toBe(false);
  });

  it("writes the Platform into the URL and keeps the other params", () => {
    const params = new URLSearchParams("platform=claude&sort=visibility");

    expect(platformScopeHref("/prompts/p-01", params, "gemini")).toBe(
      "/prompts/p-01?platform=gemini&sort=visibility",
    );
  });

  it("writes the scope into a URL that carries no params yet", () => {
    expect(platformScopeHref("/prompts/p-01", new URLSearchParams(), "claude")).toBe(
      "/prompts/p-01?platform=claude",
    );
  });
});
