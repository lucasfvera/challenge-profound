/**
 * The metrics the overview reports, with the unit each one is reported in
 * and the sentence that explains what it measures.
 *
 * They are the glossary's names, and each name comes with its own unit and
 * its own explanation, so a fourth KPI means a fourth glossary entry.
 */
export type Kpi =
  | { label: "Visibility Score"; unit: "percent"; description: string }
  | { label: "Share of Voice"; unit: "percent"; description: string }
  | { label: "Average Position"; unit: "position"; description: string };

/**
 * The metrics the overview reports, by the field their numbers arrive in.
 *
 * The explanations are the glossary's definitions, in the glossary's
 * vocabulary: a tracked question is a Prompt, an answer is an Answer, a
 * brand's appearance in one is a Mention, and the brand the app measures is
 * Northstar.
 */
export const KPIS = {
  visibilityScore: {
    label: "Visibility Score",
    unit: "percent",
    description:
      "The percentage of tracked Prompts whose Answer contains at least one Mention of Northstar, for the selected Platform over the tracked window.",
  },
  shareOfVoice: {
    label: "Share of Voice",
    unit: "percent",
    description:
      "Northstar's Mentions as a percentage of all brand Mentions across the Answers, for the selected Platform over the tracked window.",
  },
  averagePosition: {
    label: "Average Position",
    unit: "position",
    description:
      "The mean ordinal position of Northstar's first Mention in the Answers that mention it. 1 means Northstar is named first.",
  },
} as const satisfies Record<string, Kpi>;
