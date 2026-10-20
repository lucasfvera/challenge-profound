/**
 * The domain types of the Snapshot.
 *
 * The Snapshot is a fixed, fictional dataset: a point-in-time view of how four
 * brands appear in the answers of four AI assistants. Nothing here is
 * collected live. The vocabulary follows the project glossary
 * (`GLOSSARY.md`); the metric definitions are spelled out in `derive.ts`.
 */

/** The AI assistants whose answers the Snapshot tracks. */
export type PlatformId = "chatgpt" | "claude" | "gemini" | "perplexity";

export interface Platform {
  id: PlatformId;
  /** Display name, e.g. `ChatGPT`. */
  name: string;
}

/** Northstar, plus the three competitors tracked alongside it. */
export type BrandId = "northstar" | "lumen" | "vantage" | "arcadia";

/** Whether a brand is the one being measured or a competitor tracked against it. */
export type BrandKind = "subject" | "competitor";

export interface Brand {
  id: BrandId;
  /**
   * Display name. It is also the string matched inside Answer text, so it
   * must stay unambiguous there: the matcher ignores case and matches whole
   * words, and an ordinary word used as a brand name would register a false
   * Mention.
   */
  name: string;
  kind: BrandKind;
}

/** The tracked Prompts of the Snapshot. */
export type PromptId =
  | "p-01"
  | "p-02"
  | "p-03"
  | "p-04"
  | "p-05"
  | "p-06"
  | "p-07"
  | "p-08"
  | "p-09"
  | "p-10"
  | "p-11"
  | "p-12"
  | "p-13"
  | "p-14"
  | "p-15";

/**
 * The kind of question a tracked Prompt asks: `discovery` for category-level
 * questions, `comparison` for head-to-head questions, `alternatives` for
 * "what else is there", `how-to` for tasks, `pricing` for cost, and `trust`
 * for whether the numbers hold up.
 */
export type PromptCategory =
  | "discovery"
  | "comparison"
  | "alternatives"
  | "how-to"
  | "pricing"
  | "trust";

export interface Prompt {
  id: PromptId;
  /** The tracked question, as a user would ask it. */
  text: string;
  category: PromptCategory;
}

/** The sources the answers cite. */
export type CitationId =
  | "c-01"
  | "c-02"
  | "c-03"
  | "c-04"
  | "c-05"
  | "c-06"
  | "c-07"
  | "c-08"
  | "c-09"
  | "c-10"
  | "c-11"
  | "c-12";

/** A web source behind an Answer, listed in the answer's sources panel. */
export interface Citation {
  id: CitationId;
  title: string;
  url: string;
  publisher: string;
}

/**
 * The simulated answer one Platform gave for one Prompt.
 *
 * The body text is the only stored form: Mentions and Citation markers live
 * inside it, and the segments are derived from it by `segmentAnswer`. Storing
 * raw text keeps the fixture and the derived output from drifting apart.
 */
export interface Answer {
  promptId: PromptId;
  platformId: PlatformId;
  /** The answer body. Brand Mentions and `[n]` Citation markers live in it. */
  text: string;
  /**
   * The sources this answer cites, in marker order: `[1]` in the text is the
   * first entry, `[2]` the second.
   */
  citations: Citation[];
}

/** One tracked day of a brand's Visibility Score on a Platform. */
export interface VisibilityPoint {
  /** ISO date (`YYYY-MM-DD`) of the tracked day. */
  date: string;
  /** Visibility Score for that day: 0–100, as a percentage with one decimal. */
  score: number;
}

/** The tracked days of one brand on one Platform. */
export interface VisibilitySeries {
  brandId: BrandId;
  platformId: PlatformId;
  points: VisibilityPoint[];
}

/** The whole fixture: the data the app renders, and nothing else. */
export interface Snapshot {
  /** The day the stored Answers belong to: the last day of the window. */
  asOf: string;
  /** The tracked window, in ISO dates. */
  period: { start: string; end: string };
  platforms: Platform[];
  brands: Brand[];
  prompts: Prompt[];
  answers: Answer[];
  series: VisibilitySeries[];
}
