import { describe, expect, it } from "vitest";
import {
  averagePosition,
  averageVisibilityScore,
  chartData,
  platformMetrics,
  seriesPoints,
  shareOfVoice,
  shareOfVoiceTrend,
  snapshot,
  subjectMetrics,
  visibilityScore,
  visibilityTrend,
} from "@/lib/snapshot";
import type { Brand, Snapshot } from "@/lib/snapshot";

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

/** How many days of the tracked window its first half holds. */
const FIRST_HALF_DAYS = 15;

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
    expect(shareOfVoiceTrend(snapshot, "northstar", "perplexity")).toBe(-7.9);
  });

  it("moves the Share of Voice trend when the tracked scores move", () => {
    // The brand drops out of the first half of the window, so its share of
    // voice there falls to nothing and the movement grows.
    const withoutFirstHalf: Snapshot = {
      ...snapshot,
      series: snapshot.series.map((series) =>
        series.brandId === "northstar" && series.platformId === "chatgpt"
          ? {
              ...series,
              points: series.points.map((point, index) => ({
                ...point,
                score: index < FIRST_HALF_DAYS ? 0 : point.score,
              })),
            }
          : series,
      ),
    };

    expect(shareOfVoiceTrend(withoutFirstHalf, "northstar", "chatgpt")).toBe(38.1);
  });

  it("reports the measured brand's metrics and movements for a platform", () => {
    expect(subjectMetrics(snapshot, "chatgpt")).toEqual({
      visibilityScore: 66.7,
      shareOfVoice: 40,
      averagePosition: 1.5,
      visibilityTrend: 6.7,
      shareOfVoiceTrend: 5.1,
      averagePositionTrend: null,
    });
  });

  it("holds the brand's bad case on the platform it is losing ground on", () => {
    // Perplexity is where the Snapshot stops favouring the brand: it ends the
    // tracked window named in four of the fifteen tracked Answers, and both of
    // the movements it reports — the Visibility Score's and the Share of
    // Voice's — go down.
    expect(subjectMetrics(snapshot, "perplexity")).toEqual({
      visibilityScore: 26.7,
      shareOfVoice: 19,
      averagePosition: 1.5,
      visibilityTrend: -15.1,
      shareOfVoiceTrend: -7.9,
      averagePositionTrend: null,
    });
  });

  it("gives every scope a movement, and a downward one somewhere", () => {
    const movements = snapshot.platforms.map(
      (platform) => subjectMetrics(snapshot, platform.id).visibilityTrend,
    );

    // Every scope carries a Visibility Score movement — the card is never
    // mute — and the Snapshot holds the bad case, so at least one of them
    // goes down.
    expect(movements).not.toContain(null);
    expect(
      movements.some((movement) => movement !== null && movement < 0),
    ).toBe(true);
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

describe("the chart's data", () => {
  it("draws the measured brand first and the competitors after it", () => {
    const expected: Brand[] = [
      { id: "northstar", name: "Northstar", kind: "subject" },
      { id: "lumen", name: "Lumen", kind: "competitor" },
      { id: "vantage", name: "Vantage", kind: "competitor" },
      { id: "arcadia", name: "Arcadia", kind: "competitor" },
    ];

    const { series } = chartData(snapshot, "chatgpt");

    expect(series).toEqual(expected);
  });

  it("drops a brand the platform does not track", () => {
    const withoutArcadia: Snapshot = {
      ...snapshot,
      series: snapshot.series.filter(
        (series) =>
          !(series.brandId === "arcadia" && series.platformId === "chatgpt"),
      ),
    };

    const chatgpt = chartData(withoutArcadia, "chatgpt");
    const claude = chartData(withoutArcadia, "claude");

    expect(chatgpt.series.map((brand) => brand.id)).toEqual([
      "northstar",
      "lumen",
      "vantage",
    ]);
    expect(claude.series.map((brand) => brand.id)).toContain("arcadia");
  });

  it("draws one row per tracked day", () => {
    const { rows } = chartData(snapshot, "chatgpt");

    expect(rows).toHaveLength(30);
    expect(rows[0].date).toBe("2026-09-01");
    expect(rows[29].date).toBe("2026-09-30");
  });

  it("draws the tracked days in date order", () => {
    // Northstar starts tracking on the sixth day, so the days arrive out of
    // order unless the rows are sorted.
    const lateSubject: Snapshot = {
      ...snapshot,
      series: snapshot.series.map((series) =>
        series.brandId === "northstar" && series.platformId === "chatgpt"
          ? { ...series, points: series.points.slice(5) }
          : series,
      ),
    };

    const { rows } = chartData(lateSubject, "chatgpt");
    const dates = rows.map((row) => row.date);

    expect(dates).toHaveLength(30);
    expect(dates).toEqual([...dates].sort());
    expect(dates[0]).toBe("2026-09-01");
    expect(dates[29]).toBe("2026-09-30");
  });

  it("carries the tracked score of every brand on a day verbatim", () => {
    const { rows } = chartData(snapshot, "chatgpt");

    expect(rows[0].scores).toEqual({
      northstar: 46.7,
      lumen: 53.3,
      vantage: 26.7,
      arcadia: 26.7,
    });
  });

  it("leaves out a brand that was not tracked on a day", () => {
    const partlyTracked: Snapshot = {
      ...snapshot,
      series: snapshot.series.map((series) =>
        series.brandId === "arcadia" && series.platformId === "chatgpt"
          ? { ...series, points: series.points.slice(1) }
          : series,
      ),
    };

    const { rows } = chartData(partlyTracked, "chatgpt");

    expect(rows[0].scores).not.toHaveProperty("arcadia");
    expect(rows[0].scores.northstar).toBe(46.7);
    expect(rows[1].scores.arcadia).toBe(20);
    expect(rows).toHaveLength(30);
  });

  it("draws nothing for a platform with no tracked window", () => {
    const untracked: Snapshot = {
      ...snapshot,
      series: snapshot.series.filter(
        (series) => series.platformId !== "claude",
      ),
    };

    const { series, rows } = chartData(untracked, "claude");

    expect(series).toEqual([]);
    expect(rows).toEqual([]);
  });
});
