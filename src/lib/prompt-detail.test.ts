import { describe, expect, it } from "vitest";
import { findAnswer, findPrompt, isSafeExternalUrl } from "@/lib/prompt-detail";
import { snapshot } from "@/lib/snapshot";

describe("the prompt detail contract", () => {
  it("resolves every tracked Prompt", () => {
    for (const prompt of snapshot.prompts) {
      expect(findPrompt(prompt.id)?.id).toBe(prompt.id);
    }
  });

  it("does not resolve an id the Snapshot does not track", () => {
    expect(findPrompt("p-99")).toBeUndefined();
    expect(findPrompt("")).toBeUndefined();
    expect(findPrompt("P-01")).toBeUndefined();
  });

  it("resolves the Answer a Platform gave for a Prompt", () => {
    const answer = findAnswer("p-01", "chatgpt");

    expect(answer?.promptId).toBe("p-01");
    expect(answer?.platformId).toBe("chatgpt");
  });

  it("resolves the Answer of the Prompt it was asked for", () => {
    for (const answer of snapshot.answers) {
      expect(findAnswer(answer.promptId, answer.platformId)).toBe(answer);
    }
  });

  it("does not resolve a pair the Snapshot does not hold", () => {
    expect(findAnswer("p-99", "chatgpt")).toBeUndefined();
    expect(findAnswer("p-01", "gpt-4")).toBeUndefined();
    expect(findAnswer("", "")).toBeUndefined();
  });

  it("links every Citation the Snapshot holds", () => {
    for (const answer of snapshot.answers) {
      for (const citation of answer.citations) {
        expect(isSafeExternalUrl(citation.url)).toBe(true);
      }
    }
  });

  it("links only http and https URLs", () => {
    expect(isSafeExternalUrl("https://signalquarterly.example.com/a")).toBe(true);
    expect(isSafeExternalUrl("http://signalquarterly.example.com/a")).toBe(true);
  });

  it("refuses to link a URL that is not a web address", () => {
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("data:text/html;base64,PHNjcmlwdD4=")).toBe(false);
    expect(isSafeExternalUrl("file:///etc/passwd")).toBe(false);
  });

  it("refuses to link a URL that hides its scheme", () => {
    expect(isSafeExternalUrl("  javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("java\nscript:alert(1)")).toBe(false);
  });

  it("refuses to link a URL it cannot read", () => {
    expect(isSafeExternalUrl("/sources/c-03")).toBe(false);
    expect(isSafeExternalUrl("signal quarterly")).toBe(false);
    expect(isSafeExternalUrl("")).toBe(false);
  });
});
