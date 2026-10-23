import { describe, expect, it } from "vitest";
import {
  averagePosition,
  averageVisibilityScore,
  platformMetrics,
  seriesPoints,
  shareOfVoice,
  snapshot,
  visibilityScore,
  visibilityTrend,
} from "@/lib/snapshot";
import type { Snapshot } from "@/lib/snapshot";

/** A Snapshot whose only Answer names no tracked brand. */
const withoutMentions: Snapshot = {
  ...snapshot,
  answers: snapshot.answers.filter(
    (answer) => answer.promptId === "p-04" && answer.platformId === "chatgpt",
  ),
};

/** A Snapshot with no Answer at all. */
const withoutAnswers: Snapshot = { ...snapshot, answers: [] };

describe("the derivation layer", () => {
  it("computes the Visibility Score as the share of tracked prompts whose answer mentions the brand", () => {
    expect(visibilityScore(snapshot, "northstar", "chatgpt")).toBe(66.7);
    expect(visibilityScore(snapshot, "arcadia", "chatgpt")).toBe(20);
  });

  it("computes Share of Voice against every mention in the answers", () => {
    const shares = snapshot.brands.map(
      (brand) => shareOfVoice(snapshot, brand.id, "chatgpt"),
    );

    expect(shares).toEqual([40, 28, 20, 12]);
  });

  it("computes Average Position from the first mention in each answer", () => {
    expect(averagePosition(snapshot, "northstar", "chatgpt")).toBe(1.5);
    expect(averagePosition(snapshot, "arcadia", "chatgpt")).toBe(2.3);
  });

  it("aggregates every platform into one bundle of metrics", () => {
    const metrics = platformMetrics(snapshot);

    expect(metrics.map((entry) => entry.platformId)).toEqual([
      "chatgpt",
      "claude",
      "gemini",
      "perplexity",
    ]);
    expect(metrics[0].answerCount).toBe(15);

    const northstar = metrics[0].brands.find(
      (brand) => brand.brandId === "northstar",
    );
    expect(northstar?.visibilityScore).toBe(66.7);
    expect(northstar?.shareOfVoice).toBe(40);
    expect(northstar?.averagePosition).toBe(1.5);
  });

  it("compares the two halves of a tracked window", () => {
    const points = seriesPoints(snapshot, "northstar", "chatgpt");

    expect(points).toHaveLength(30);
    expect(averageVisibilityScore(points)).toBe(58.9);
    expect(visibilityTrend(points)).toBe(6.7);

    // An odd window gives the extra point to the later half.
    expect(
      visibilityTrend([
        { date: "2026-09-01", score: 10 },
        { date: "2026-09-02", score: 40 },
        { date: "2026-09-03", score: 70 },
      ]),
    ).toBe(45);
  });

  it("reports zero Visibility Score and null Share of Voice when no answer mentions the brand", () => {
    expect(visibilityScore(withoutMentions, "northstar", "chatgpt")).toBe(0);
    expect(shareOfVoice(withoutMentions, "northstar", "chatgpt")).toBeNull();
    expect(averagePosition(withoutMentions, "northstar", "chatgpt")).toBeNull();
  });

  it("returns null when there is no answer to measure", () => {
    expect(visibilityScore(withoutAnswers, "northstar", "chatgpt")).toBeNull();
    expect(shareOfVoice(withoutAnswers, "northstar", "chatgpt")).toBeNull();
    expect(averagePosition(withoutAnswers, "northstar", "chatgpt")).toBeNull();
  });

  it("returns null for an empty series", () => {
    expect(averageVisibilityScore([])).toBeNull();
    expect(visibilityTrend([])).toBeNull();
    expect(
      visibilityTrend([{ date: "2026-09-01", score: 40 }]),
    ).toBeNull();
  });
});
