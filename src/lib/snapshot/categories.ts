import type { PromptCategory } from "./types";

/**
 * The names the Snapshot's own Prompt categories are shown under.
 *
 * They live in their own module, beside the Platform names and for the same
 * reason: two surfaces show the category of a tracked Prompt — the tracked
 * prompts table and the prompt detail route's message — and the two must not
 * spell it differently.
 *
 * The record holds no data of its own, so any surface can read it without
 * dragging the Snapshot's fixture in with it.
 */
export const CATEGORY_LABELS: Record<PromptCategory, string> = {
  discovery: "Discovery",
  comparison: "Comparison",
  alternatives: "Alternatives",
  "how-to": "How-to",
  pricing: "Pricing",
  trust: "Trust",
};
