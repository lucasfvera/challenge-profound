import { describe, expect, it } from "vitest";
import {
  averagePosition,
  averageVisibilityScore,
  platformMetrics,
  seriesPoints,
  shareOfVoice,
  shareOfVoiceTrend,
  snapshot,
  subjectMetrics,
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

/** A Snapshot that measures no brand. */
const withoutSubject: Snapshot = {
  ...snapshot,
  brands: snapshot.brands.filter((brand) => brand.kind !== "subject"),
};

/** A Snapshot whose tracked window holds a single day. */
const oneDay: Snapshot = {
  ...snapshot,
  series: snapshot.series.map((series) => ({
    ...series,
    points: series.points.slice(0, 1),
  })),
};

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

  it("compares the two halves of the tracked window for the Share of Voice", () => {
    expect(shareOfVoiceTrend(snapshot, "northstar", "chatgpt")).toBe(5.1);
    expect(shareOfVoiceTrend(snapshot, "northstar", "perplexity")).toBe(2.7);
  });

  it("follows the tracked scores in the Share of Voice trend", () => {
    // The brand drops out of the first half of the window, so its share of
    // voice there falls to nothing and the movement grows.
    const withoutFirstHalf: Snapshot = {
      ...snapshot,
      series: snapshot.series.map((series) =>
        series.brandId === "northstar" && series.platformId === "chatgpt"
          ? { ...series, points: series.points.map((point, index) => ({ ...point, score: index < 15 ? 0 : point.score })) }
          : series,
      ),
    };

    expect(shareOfVoiceTrend(withoutFirstHalf, "northstar", "chatgpt")).toBe(38.1);
  });

  it("reports the measured brand's metrics and movements for a platform", () => {
    const northstar = platformMetrics(snapshot)
      .find((entry) => entry.platformId === "chatgpt")
      ?.brands.find((entry) => entry.brandId === "northstar");

    expect(subjectMetrics(snapshot, "chatgpt")).toEqual({
      visibilityScore: northstar?.visibilityScore,
      shareOfVoice: northstar?.shareOfVoice,
      averagePosition: northstar?.averagePosition,
      visibilityTrend: 6.7,
      shareOfVoiceTrend: 5.1,
      averagePositionTrend: null,
    });
  });

  it("reports no metrics when the Snapshot measures no brand", () => {
    expect(subjectMetrics(withoutSubject, "chatgpt")).toEqual({
      visibilityScore: null,
      shareOfVoice: null,
      averagePosition: null,
      visibilityTrend: null,
      shareOfVoiceTrend: null,
      averagePositionTrend: null,
    });
  });

  it("returns null for a Share of Voice trend with nothing to compare", () => {
    expect(shareOfVoiceTrend(oneDay, "northstar", "chatgpt")).toBeNull();
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
