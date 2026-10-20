import { segmentAnswer, subjectBrand } from "@/lib/snapshot";
import type {
  Answer,
  Brand,
  MentionSegment,
  Platform,
  PlatformId,
  Prompt,
  PromptId,
  Snapshot,
} from "@/lib/snapshot";

/**
 * The prompt table contract: the table's read of the Snapshot.
 *
 * The table is the read-only view of the tracked Prompts — the Prompt's own
 * text and category, and the brand the Snapshot measures on each Platform.
 *
 * Every Mention state comes from `segmentAnswer`, the one place an Answer
 * body is cut into segments, so the Mentions the table counts are the Mentions
 * the answer panel renders and the KPI cards count. The two halves of the
 * dashboard therefore cannot disagree.
 *
 * The Snapshot holds one Answer per Prompt and Platform pair — the invariant
 * the derivation layer's Visibility Score and Average Position rest on as
 * well, and the one the fixture's suite keeps. The table reads the same
 * Answer per pair, so it and the KPI cards count the same Mentions.
 */

/**
 * The brand the Snapshot measures in one Answer.
 *
 * `mentioned` carries the position the brand was named at: the ordinal of
 * the brand's first Mention in the Answer, 1 meaning it was named first.
 * `absent` means the Answer exists and does not name the brand. `no-data`
 * means the Snapshot cannot report a Mention here — the Platform gave no
 * Answer for the Prompt, or the Snapshot marks no brand as the subject — and
 * it carries the reason, so the surface can tell the two apart.
 */
export type MentionState =
  | { kind: "mentioned"; position: number }
  | { kind: "absent" }
  | { kind: "no-data"; reason: "no-answer" | "no-subject" };

/** The brand's Mention state on one Platform, for one Prompt. */
export interface PlatformMention {
  /** The Platform the state belongs to. */
  platform: Platform;
  /** The brand's Mention state in that Platform's Answer for the Prompt. */
  state: MentionState;
}

/** One row of the prompt table: a tracked Prompt and its Mention states. */
export interface PromptRow {
  /** The tracked Prompt the row shows. */
  prompt: Prompt;
  /** The Mention state per tracked Platform, in the Snapshot's Platform order. */
  mentions: PlatformMention[];
}

/**
 * The rows of the prompt table, ordered for a Platform.
 *
 * The order is the brand's strength on that Platform: the Prompts whose
 * Answer names the brand come first, best position first, then the Prompts
 * the Platform answered without naming it, then the Prompts with no data.
 *
 * The sort is stable, so Prompts the Platform orders equally keep the
 * Snapshot's own order. The table therefore reads the same on every render
 * and needs nothing from the reader to be ordered.
 */
export function promptTableRows(
  snapshot: Snapshot,
  platformId: PlatformId,
): PromptRow[] {
  const brand = subjectBrand(snapshot);
  const answers = answersByPrompt(snapshot);

  const rows = snapshot.prompts.map((prompt) => {
    const promptAnswers = answers.get(prompt.id) ?? [];

    // The scoped Platform's own state: the one the order follows. It is
    // computed for the Platform the scope names rather than looked up among
    // the row's mentions, so the order never rests on a lookup that could
    // miss.
    const scopeState = mentionState(
      snapshot,
      brand,
      promptAnswers,
      platformId,
    );

    const mentions = snapshot.platforms.map((platform) => ({
      platform,
      state:
        platform.id === platformId
          ? scopeState
          : mentionState(snapshot, brand, promptAnswers, platform.id),
    }));

    return { prompt, mentions, scopeState };
  });

  return rows
    .sort((left, right) => compareStates(left.scopeState, right.scopeState))
    .map(({ prompt, mentions }) => ({ prompt, mentions }));
}

/**
 * The Answers of the Snapshot, grouped by the Prompt they answer.
 *
 * The grouping keeps the lookup for one Prompt and Platform off the whole
 * Answer list, and it is the shape the table reads them in.
 */
function answersByPrompt(snapshot: Snapshot): Map<PromptId, Answer[]> {
  const answers = new Map<PromptId, Answer[]>();

  for (const answer of snapshot.answers) {
    const promptAnswers = answers.get(answer.promptId) ?? [];
    promptAnswers.push(answer);
    answers.set(answer.promptId, promptAnswers);
  }

  return answers;
}

/**
 * The brand's Mention state in one Platform's Answer for one Prompt.
 *
 * The brand's first Mention is the one the Answer reports: the segments come
 * out of the Answer in the order the Mentions appear in it, so the first
 * segment naming the brand carries the lowest ordinal of that brand — the
 * same ordinal `averagePosition` averages over.
 */
function mentionState(
  snapshot: Snapshot,
  brand: Brand | undefined,
  promptAnswers: Answer[],
  platformId: PlatformId,
): MentionState {
  if (!brand) return { kind: "no-data", reason: "no-subject" };

  const answer = promptAnswers.find(
    (entry) => entry.platformId === platformId,
  );

  if (!answer) return { kind: "no-data", reason: "no-answer" };

  const mention = segmentAnswer(answer, snapshot.brands).find(
    (segment): segment is MentionSegment =>
      segment.kind === "mention" && segment.brandId === brand.id,
  );

  if (!mention) return { kind: "absent" };

  return { kind: "mentioned", position: mention.ordinal };
}

/**
 * The order two Mention states are compared by.
 *
 * A Mention comes first, and the earlier position comes first; a Prompt the
 * Platform answered without the brand comes next, and a Prompt with no data
 * comes last.
 */
function compareStates(left: MentionState, right: MentionState): number {
  if (left.kind === "mentioned" && right.kind === "mentioned") {
    return left.position - right.position;
  }

  return precedenceOf(left) - precedenceOf(right);
}

/** The precedence a Mention state is ordered by: mentioned, absent, no data. */
function precedenceOf(state: MentionState): number {
  if (state.kind === "mentioned") return 0;
  if (state.kind === "absent") return 1;

  return 2;
}
