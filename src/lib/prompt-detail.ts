import { snapshot } from "@/lib/snapshot";
import type { Answer, Prompt } from "@/lib/snapshot";

/**
 * The prompt detail contract: the detail route's read of the Snapshot.
 *
 * The route shows one tracked Prompt, the Answer a Platform gave for it, and
 * the sources behind that Answer. These are the lookups it makes. They answer
 * `undefined` rather than throwing, so the route decides what a Prompt the
 * Snapshot does not track means — a 404 — instead of a lookup deciding it.
 *
 * The link policy for those sources lives here too: the citations panel has
 * to know which of the Snapshot's URLs may become an anchor.
 */

/**
 * The tracked Prompt a raw path id stands for, or `undefined`.
 *
 * The id is matched exactly: the Snapshot's ids are lowercase, and a
 * hand-edited id that differs in any way is not a Prompt.
 */
export function findPrompt(promptId: string): Prompt | undefined {
  return snapshot.prompts.find((prompt) => prompt.id === promptId);
}

/**
 * The Answer a Platform gave for a Prompt, or `undefined`.
 *
 * Both ids are matched exactly, so a pair the Snapshot does not hold — a
 * Prompt that is not tracked, a Platform that is not tracked — answers
 * `undefined` rather than a neighbouring Answer.
 */
export function findAnswer(
  promptId: string,
  platformId: string,
): Answer | undefined {
  return snapshot.answers.find(
    (answer) =>
      answer.promptId === promptId && answer.platformId === platformId,
  );
}

/** The URL schemes a Citation may be linked to. */
const LINKABLE_PROTOCOLS = ["http:", "https:"];

/**
 * Whether a Citation's URL is safe to link to.
 *
 * Only `http:` and `https:` are linkable: a link that opens in a new tab
 * must never carry a `javascript:` or `data:` URL. A URL that cannot be
 * parsed is not linkable either — the Citation is rendered as text instead.
 */
export function isSafeExternalUrl(url: string): boolean {
  let protocol: string;

  try {
    protocol = new URL(url).protocol;
  } catch {
    return false;
  }

  return LINKABLE_PROTOCOLS.includes(protocol);
}
