import { describe, expect, it } from "vitest";
import { platformSeries, segmentAnswer, snapshot, visibilityScore } from "@/lib/snapshot";
import type { MentionSegment } from "@/lib/snapshot";

describe("the Snapshot fixture", () => {
  it("holds the tracked scope", () => {
    expect(snapshot.platforms).toHaveLength(4);
    expect(snapshot.brands).toHaveLength(4);
    expect(snapshot.prompts).toHaveLength(15);
    expect(snapshot.answers).toHaveLength(60);
    expect(snapshot.series).toHaveLength(16);

    for (const answer of snapshot.answers) {
      expect(answer.citations.length).toBeGreaterThan(0);
    }

    for (const series of snapshot.series) {
      expect(series.points).toHaveLength(30);
      expect(series.points.at(-1)?.date).toBe(snapshot.period.end);
    }
  });

  it("resolves every id it references", () => {
    const promptIds = new Set(snapshot.prompts.map((prompt) => prompt.id));
    const platformIds = new Set(snapshot.platforms.map((platform) => platform.id));
    const brandIds = new Set(snapshot.brands.map((brand) => brand.id));

    for (const answer of snapshot.answers) {
      expect(promptIds.has(answer.promptId)).toBe(true);
      expect(platformIds.has(answer.platformId)).toBe(true);
    }

    for (const series of snapshot.series) {
      expect(brandIds.has(series.brandId)).toBe(true);
      expect(platformIds.has(series.platformId)).toBe(true);
    }
  });

  it("answers every prompt on every platform", () => {
    const answered = new Set(
      snapshot.answers.map((answer) => `${answer.promptId}-${answer.platformId}`),
    );

    for (const prompt of snapshot.prompts) {
      for (const platform of snapshot.platforms) {
        expect(answered.has(`${prompt.id}-${platform.id}`)).toBe(true);
      }
    }
  });

  it("cites nothing outside the reserved example domains", () => {
    for (const answer of snapshot.answers) {
      for (const citation of answer.citations) {
        expect(new URL(citation.url).hostname).toMatch(/\.example\.com$/);
      }
    }
  });

  it("names every brand at most once per answer", () => {
    for (const answer of snapshot.answers) {
      const mentions = segmentAnswer(answer, snapshot.brands).filter(
        (segment): segment is MentionSegment => segment.kind === "mention",
      );
      const named = mentions.map((mention) => mention.brandId);

      expect(new Set(named).size).toBe(named.length);
    }
  });

  it("ends every series on the score its answers produce", () => {
    for (const platform of snapshot.platforms) {
      for (const brand of snapshot.brands) {
        const series = platformSeries(snapshot, platform.id).find(
          (entry) => entry.brandId === brand.id,
        );

        expect(series?.points.at(-1)?.score).toBe(
          visibilityScore(snapshot, brand.id, platform.id),
        );
      }
    }
  });
});
