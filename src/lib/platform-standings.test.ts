import { describe, expect, it } from "vitest";
import { platformStandings } from "@/lib/platform-standings";
import { snapshot, subjectMetrics } from "@/lib/snapshot";
import type { Snapshot } from "@/lib/snapshot";

/**
 * A Snapshot where two Platforms name the brand in every Answer, one names
 * the rival in every Answer, and one gave no Answer at all.
 *
 * The Snapshot's own answers are rewritten rather than replaced: the bodies
 * are the only thing that decides who is named, and the platform they belong
 * to is what decides the score. Gemini's answers are left out, so Gemini has
 * no score to rank by — which is a different thing from scoring zero.
 */
const mixed: Snapshot = {
  ...snapshot,
  answers: snapshot.answers
    .filter((answer) => answer.platformId !== "gemini")
    .map((answer) => ({
      ...answer,
      text:
        answer.platformId === "perplexity"
          ? "Lumen leads the category."
          : "Northstar leads the category.",
    })),
};

describe("the platform standings", () => {
  it("ranks the platforms by how often they name the brand", () => {
    const standings = platformStandings(snapshot);

    expect(standings.map((standing) => standing.platform.id)).toEqual([
      "claude",
      "chatgpt",
      "gemini",
      "perplexity",
    ]);
    expect(standings.map((standing) => standing.visibilityScore)).toEqual([
      73.3, 66.7, 53.3, 26.7,
    ]);
  });

  it("gives every platform the place it holds", () => {
    const standings = platformStandings(snapshot);

    expect(standings.map((standing) => standing.rank)).toEqual([1, 2, 3, 4]);
  });

  it("reports the same score the KPI card reports for each platform", () => {
    const standings = platformStandings(snapshot);

    standings.forEach((standing) => {
      expect(standing.visibilityScore).toBe(
        subjectMetrics(snapshot, standing.platform.id).visibilityScore,
      );
    });
  });

  it("gives equal scores the same place and skips the one after them", () => {
    const standings = platformStandings(mixed);

    // The two Platforms that name the brand equally keep the Snapshot's
    // order, so the podium reads the same on every render.
    expect(standings.map((standing) => standing.platform.id)).toEqual([
      "chatgpt",
      "claude",
      "perplexity",
      "gemini",
    ]);
    expect(standings.map((standing) => standing.visibilityScore)).toEqual([
      100, 100, 0, null,
    ]);

    // The place after a tie skips the ones the tie took: the third Platform
    // holds the third place, not the second.
    expect(standings.map((standing) => standing.rank)).toEqual([
      1, 1, 3, null,
    ]);
  });

  it("leaves a platform the snapshot cannot score unranked", () => {
    const standings = platformStandings(mixed);

    const unscored = standings.find(
      (standing) => standing.platform.id === "gemini",
    );

    // A Platform that gave no Answer has no score and no place: the
    // Snapshot cannot answer for it, and a zero would read as a measurement.
    expect(unscored?.visibilityScore).toBeNull();
    expect(unscored?.rank).toBeNull();
  });

  it("ranks nothing when the snapshot measures no brand", () => {
    const withoutSubject: Snapshot = {
      ...snapshot,
      brands: snapshot.brands.filter((brand) => brand.kind !== "subject"),
    };

    const standings = platformStandings(withoutSubject);

    // Every Platform is still listed, and none of them has a score or a
    // place: there is no brand to measure them against.
    expect(standings.map((standing) => standing.visibilityScore)).toEqual([
      null, null, null, null,
    ]);
    expect(standings.map((standing) => standing.rank)).toEqual([
      null, null, null, null,
    ]);
  });
});
