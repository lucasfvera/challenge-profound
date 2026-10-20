import { describe, expect, it } from "vitest";
import { promptTableRows } from "@/lib/prompt-table";
import type { MentionState, PromptRow } from "@/lib/prompt-table";
import {
  averagePosition,
  snapshot,
  visibilityScore,
} from "@/lib/snapshot";
import { PLATFORMS } from "@/lib/snapshot/platforms";
import type {
  Answer,
  Brand,
  Platform,
  PlatformId,
  Prompt,
  PromptId,
  Snapshot,
} from "@/lib/snapshot";

/** The brand the Snapshot measures: Northstar. */
const SUBJECT_BRAND = "northstar";

/** The two Platforms the synthetic Snapshots below track. */
const TRACKED: Platform[] = PLATFORMS.filter(
  (platform) => platform.id === "chatgpt" || platform.id === "claude",
);

/** The brand the synthetic Snapshots below measure. */
const SUBJECT: Brand = { id: "northstar", name: "Northstar", kind: "subject" };

/** A brand the synthetic Snapshots below track alongside the subject. */
const COMPETITOR: Brand = { id: "lumen", name: "Lumen", kind: "competitor" };

/** The two tracked Prompts of the synthetic Snapshots below. */
const PROMPTS: Prompt[] = [
  {
    id: "p-01",
    text: "best AI visibility analytics tools",
    category: "comparison",
  },
  {
    id: "p-02",
    text: "alternatives to Northstar for AI brand tracking",
    category: "alternatives",
  },
];

/** The state of a Prompt the brand was named in. */
type Mentioned = Extract<MentionState, { kind: "mentioned" }>;

/** The Answer a synthetic Snapshot holds for a Prompt on a Platform. */
function answerFor(
  promptId: PromptId,
  platformId: PlatformId,
  text: string,
): Answer {
  return { promptId, platformId, text, citations: [] };
}

/**
 * A Snapshot with two Prompts and two Platforms.
 *
 * Northstar leads the first Prompt on ChatGPT and the second one on Claude,
 * so the two Platforms order the rows differently.
 */
function aSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    asOf: "2026-03-01",
    period: { start: "2026-02-01", end: "2026-03-01" },
    platforms: TRACKED,
    brands: [SUBJECT, COMPETITOR],
    prompts: PROMPTS,
    answers: [
      answerFor("p-01", "chatgpt", "Northstar leads the category."),
      answerFor("p-01", "claude", "Lumen leads the category."),
      answerFor("p-02", "chatgpt", "Lumen leads the category."),
      answerFor("p-02", "claude", "Northstar leads the category."),
    ],
    series: [],
    ...overrides,
  };
}

/**
 * The Mention state each row carries for a Platform.
 *
 * The rows carry one state per tracked Platform, in the Platform order of
 * the list they were built from.
 */
function statesOn(
  rows: PromptRow[],
  platforms: Platform[],
  platformId: PlatformId,
): MentionState[] {
  const index = platforms.findIndex((platform) => platform.id === platformId);

  return rows.map((row) => row.mentions[index].state);
}

/** The Mention state a Prompt carries on every Platform. */
function statesFor(rows: PromptRow[], promptId: PromptId) {
  return rows
    .filter((row) => row.prompt.id === promptId)
    .flatMap((row) =>
      row.mentions.map((mention) => ({
        platform: mention.platform.id,
        state: mention.state,
      })),
    );
}

describe("the prompt table", () => {
  it("lists every tracked Prompt", () => {
    const rows = promptTableRows(snapshot, "chatgpt");

    expect(rows).toHaveLength(snapshot.prompts.length);
    expect(rows.map((row) => row.prompt.id).sort()).toEqual(
      snapshot.prompts.map((prompt) => prompt.id).sort(),
    );
  });

  it("carries a Mention state for every tracked Platform", () => {
    const rows = promptTableRows(snapshot, "chatgpt");

    for (const row of rows) {
      expect(row.mentions.map((mention) => mention.platform.id)).toEqual(
        snapshot.platforms.map((platform) => platform.id),
      );
    }
  });

  it("agrees with the KPI cards on the Platform the table is scoped to", () => {
    for (const platform of snapshot.platforms) {
      const rows = promptTableRows(snapshot, platform.id);

      const positions: number[] = [];
      for (const state of statesOn(rows, snapshot.platforms, platform.id)) {
        if (state.kind === "mentioned") positions.push(state.position);
      }

      const score = visibilityScore(snapshot, SUBJECT_BRAND, platform.id);
      expect(score).not.toBeNull();

      // The KPI card rounds to one decimal; the share the table counts is
      // exact.
      const share = (positions.length / snapshot.prompts.length) * 100;
      expect(Math.round(share * 10) / 10).toBe(score);

      const average = averagePosition(snapshot, SUBJECT_BRAND, platform.id);
      expect(average).not.toBeNull();

      const mean =
        positions.reduce((sum, position) => sum + position, 0) /
        positions.length;
      expect(Math.round(mean * 10) / 10).toBe(average);
    }
  });

  it("orders the rows by the brand's strength on the Platform", () => {
    for (const platform of snapshot.platforms) {
      const rows = promptTableRows(snapshot, platform.id);
      const states = statesOn(rows, snapshot.platforms, platform.id);

      const mentioned = states.filter(
        (state): state is Mentioned => state.kind === "mentioned",
      );
      expect(mentioned.length).toBeGreaterThan(0);

      // The Mentions come first, the earlier position first among them.
      const positions = mentioned.map((state) => state.position);
      expect(positions).toEqual(
        [...positions].sort((left, right) => left - right),
      );

      // And no Prompt the Platform answered without a Mention comes before
      // one that has it.
      const firstWithout = states.findIndex(
        (state) => state.kind !== "mentioned",
      );
      expect(firstWithout).toBe(mentioned.length);
    }
  });

  it("gives every Platform its own Mention state for a Prompt", () => {
    const rows = promptTableRows(aSnapshot(), "chatgpt");

    expect(statesFor(rows, "p-01")).toEqual([
      { platform: "chatgpt", state: { kind: "mentioned", position: 1 } },
      { platform: "claude", state: { kind: "absent" } },
    ]);
    expect(statesFor(rows, "p-02")).toEqual([
      { platform: "chatgpt", state: { kind: "absent" } },
      { platform: "claude", state: { kind: "mentioned", position: 1 } },
    ]);
  });

  it("orders the rows by the Platform the table is scoped to", () => {
    const snapshot = aSnapshot();

    expect(
      promptTableRows(snapshot, "chatgpt").map((row) => row.prompt.id),
    ).toEqual(["p-01", "p-02"]);
    expect(
      promptTableRows(snapshot, "claude").map((row) => row.prompt.id),
    ).toEqual(["p-02", "p-01"]);
  });

  it("puts a Prompt the Platform answered without a Mention before one it never answered", () => {
    const rows = promptTableRows(
      aSnapshot({
        platforms: [TRACKED[0]],
        answers: [answerFor("p-01", "chatgpt", "Lumen leads the category.")],
      }),
      "chatgpt",
    );

    expect(statesOn(rows, [TRACKED[0]], "chatgpt")).toEqual([
      { kind: "absent" },
      { kind: "no-data", reason: "no-answer" },
    ]);
    expect(rows.map((row) => row.prompt.id)).toEqual(["p-01", "p-02"]);
  });

  it("puts the better position first", () => {
    const rows = promptTableRows(
      aSnapshot({
        answers: [
          answerFor("p-01", "chatgpt", "Lumen leads, Northstar follows."),
          answerFor("p-02", "chatgpt", "Northstar leads, Lumen follows."),
          answerFor("p-01", "claude", "Northstar leads the category."),
          answerFor("p-02", "claude", "Northstar leads the category."),
        ],
      }),
      "chatgpt",
    );

    expect(rows.map((row) => row.prompt.id)).toEqual(["p-02", "p-01"]);
  });

  it("keeps the Snapshot's order for the rows a Platform orders equally", () => {
    const rows = promptTableRows(
      aSnapshot({
        answers: [
          answerFor("p-01", "chatgpt", "Lumen leads the category."),
          answerFor("p-02", "chatgpt", "Arcadia leads the category."),
          answerFor("p-01", "claude", "Northstar leads the category."),
          answerFor("p-02", "claude", "Northstar leads the category."),
        ],
      }),
      "chatgpt",
    );

    // Neither Answer names the subject, so both order the same.
    expect(rows.map((row) => row.prompt.id)).toEqual(["p-01", "p-02"]);
  });

  it("reports no data for a Platform that never answered the Prompt", () => {
    const rows = promptTableRows(
      aSnapshot({
        answers: [
          answerFor("p-01", "chatgpt", "Northstar leads the category."),
          answerFor("p-02", "chatgpt", "Northstar leads the category."),
        ],
      }),
      "chatgpt",
    );

    // ChatGPT answered; Claude never did.
    expect(statesFor(rows, "p-01")).toEqual([
      { platform: "chatgpt", state: { kind: "mentioned", position: 1 } },
      { platform: "claude", state: { kind: "no-data", reason: "no-answer" } },
    ]);
  });

  it("reports no data when the Snapshot holds no Answers", () => {
    const rows = promptTableRows(aSnapshot({ answers: [] }), "chatgpt");

    expect(statesOn(rows, TRACKED, "chatgpt")[0]).toEqual({
      kind: "no-data",
      reason: "no-answer",
    });
  });

  it("reports no data when the Snapshot measures no brand", () => {
    const rows = promptTableRows(
      aSnapshot({ brands: [COMPETITOR] }),
      "chatgpt",
    );

    expect(statesOn(rows, TRACKED, "chatgpt")[0]).toEqual({
      kind: "no-data",
      reason: "no-subject",
    });
  });
});
