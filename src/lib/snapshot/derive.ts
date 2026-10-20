import { segmentAnswer } from "./segment";
import type { MentionSegment } from "./segment";
import type {
  Answer,
  Brand,
  BrandId,
  PlatformId,
  Snapshot,
  VisibilityPoint,
  VisibilitySeries,
} from "./types";

/**
 * The derivation layer: the pure functions the app reads instead of doing
 * arithmetic over the Snapshot itself.
 *
 * Every function here is a pure function of its inputs — no clock, no
 * randomness, no module state. A metric the data cannot answer is `null`,
 * which the dashboard renders as an em dash; it is never `NaN`, and never a
 * zero that would read as a real measurement.
 *
 * The metric definitions are the project's vocabulary; `GLOSSARY.md` is the
 * source, and each function repeats the definition it implements.
 */

/**
 * The metrics of one brand on one platform.
 */
export interface BrandMetrics {
  brandId: BrandId;
  /**
   * Visibility Score: the percentage of tracked Prompts whose Answer contains
   * at least one Mention of the brand.
   */
  visibilityScore: number | null;
  /**
   * Share of Voice: the brand's Mentions as a percentage of all brand Mentions
   * across the Answers.
   */
  shareOfVoice: number | null;
  /**
   * Average Position: the mean ordinal position of the brand's first Mention
   * within the Answers that mention it. 1 means the brand is named first.
   */
  averagePosition: number | null;
}

/**
 * The metrics of one platform, one entry per tracked brand.
 */
export interface PlatformMetrics {
  platformId: PlatformId;
  /** How many tracked Prompts were answered on this platform. */
  answerCount: number;
  brands: BrandMetrics[];
}

/** One mention of a brand inside an answer. */
interface BrandMention {
  brandId: BrandId;
  /** The mention's 1-based position among the answer's mentions. */
  ordinal: number;
}

/**
 * The mentions of every answer, in the order the answers were given.
 */
type AnswerMentions = BrandMention[][];

/**
 * Visibility Score: the percentage of tracked Prompts whose Answer on the
 * platform contains at least one Mention of the brand.
 *
 * The denominator is the tracked Prompt set, so a platform that answered only
 * part of it scores lower. `null` when there is no answer to measure.
 */
export function visibilityScore(
  snapshot: Snapshot,
  brandId: BrandId,
  platformId: PlatformId,
): number | null {
  return visibilityScoreFrom(
    mentionsOf(answersOn(snapshot, platformId), snapshot.brands),
    brandId,
    snapshot.prompts.length,
  );
}

/**
 * Share of Voice: the brand's Mentions as a percentage of every brand Mention
 * in the platform's Answers.
 *
 * `null` when the Answers hold no mention at all.
 */
export function shareOfVoice(
  snapshot: Snapshot,
  brandId: BrandId,
  platformId: PlatformId,
): number | null {
  return shareOfVoiceFrom(
    mentionsOf(answersOn(snapshot, platformId), snapshot.brands),
    brandId,
  );
}

/**
 * Average Position: the mean ordinal position of the brand's first Mention in
 * the platform's Answers that mention it.
 *
 * `null` when no Answer mentions the brand.
 */
export function averagePosition(
  snapshot: Snapshot,
  brandId: BrandId,
  platformId: PlatformId,
): number | null {
  return averagePositionFrom(
    mentionsOf(answersOn(snapshot, platformId), snapshot.brands),
    brandId,
  );
}

/**
 * The metrics of every platform, one entry per tracked brand.
 *
 * This is the per-platform aggregation the dashboard reads: the KPI cards, the
 * chart, and the prompt table all take their numbers from it, so they cannot
 * disagree with each other.
 */
export function platformMetrics(snapshot: Snapshot): PlatformMetrics[] {
  return snapshot.platforms.map((platform) => {
    const answers = answersOn(snapshot, platform.id);
    const mentions = mentionsOf(answers, snapshot.brands);

    return {
      platformId: platform.id,
      answerCount: answers.length,
      brands: snapshot.brands.map((brand) => ({
        brandId: brand.id,
        visibilityScore: visibilityScoreFrom(
          mentions,
          brand.id,
          snapshot.prompts.length,
        ),
        shareOfVoice: shareOfVoiceFrom(mentions, brand.id),
        averagePosition: averagePositionFrom(mentions, brand.id),
      })),
    };
  });
}

/**
 * The tracked days of every brand on one platform.
 */
export function platformSeries(
  snapshot: Snapshot,
  platformId: PlatformId,
): VisibilitySeries[] {
  return snapshot.series.filter((series) => series.platformId === platformId);
}

/**
 * The tracked days of one brand on one platform, empty when the Snapshot does
 * not track that pair.
 */
export function seriesPoints(
  snapshot: Snapshot,
  brandId: BrandId,
  platformId: PlatformId,
): VisibilityPoint[] {
  const series = snapshot.series.find(
    (entry) => entry.brandId === brandId && entry.platformId === platformId,
  );

  return series?.points ?? [];
}

/**
 * The mean Visibility Score of a tracked window.
 *
 * `null` when the window is empty. A one-day window has a mean: its only
 * point.
 */
export function averageVisibilityScore(
  points: VisibilityPoint[],
): number | null {
  if (points.length === 0) return null;
  return roundToOneDecimal(meanVisibilityScore(points));
}

/**
 * The period-over-period movement of a tracked window: the mean of its second
 * half minus the mean of its first half. The later half takes the extra point
 * when the window has an odd number of days.
 *
 * The halves are averaged before rounding, so the trend is not the difference
 * of the two rounded averages.
 *
 * `null` when there is nothing to compare — a window of one day or less.
 */
export function visibilityTrend(points: VisibilityPoint[]): number | null {
  if (points.length < 2) return null;

  const split = Math.floor(points.length / 2);
  const earlier = points.slice(0, split);
  const later = points.slice(split);

  return roundToOneDecimal(
    meanVisibilityScore(later) - meanVisibilityScore(earlier),
  );
}

/** The answers one platform gave for the tracked Prompts. */
function answersOn(snapshot: Snapshot, platformId: PlatformId): Answer[] {
  return snapshot.answers.filter(
    (answer) => answer.platformId === platformId,
  );
}

/** The mentions of every answer, in the order the answers were given. */
function mentionsOf(answers: Answer[], brands: Brand[]): AnswerMentions {
  return answers.map((answer) =>
    segmentAnswer(answer, brands)
      .filter((segment): segment is MentionSegment => segment.kind === "mention")
      .map((segment) => ({
        brandId: segment.brandId,
        ordinal: segment.ordinal,
      })),
  );
}

/** The share of the tracked Prompts whose answer mentions the brand. */
function visibilityScoreFrom(
  mentions: AnswerMentions,
  brandId: BrandId,
  trackedPrompts: number,
): number | null {
  if (mentions.length === 0 || trackedPrompts === 0) return null;

  const answered = mentions.filter((list) =>
    list.some((mention) => mention.brandId === brandId),
  ).length;

  return roundToOneDecimal((answered / trackedPrompts) * 100);
}

/** The brand's share of every mention in the answers. */
function shareOfVoiceFrom(
  mentions: AnswerMentions,
  brandId: BrandId,
): number | null {
  const all = mentions.flat();
  if (all.length === 0) return null;

  const own = all.filter((mention) => mention.brandId === brandId).length;

  return roundToOneDecimal((own / all.length) * 100);
}

/** The mean ordinal position of the brand's first mention per answer. */
function averagePositionFrom(
  mentions: AnswerMentions,
  brandId: BrandId,
): number | null {
  const firstPositions = mentions
    .map((list) =>
      list
        .filter((mention) => mention.brandId === brandId)
        .map((mention) => mention.ordinal),
    )
    .filter((ordinals) => ordinals.length > 0)
    .map((ordinals) => Math.min(...ordinals));

  if (firstPositions.length === 0) return null;

  const total = firstPositions.reduce((sum, position) => sum + position, 0);

  return roundToOneDecimal(total / firstPositions.length);
}

/** The mean Visibility Score of a window of points. */
function meanVisibilityScore(points: VisibilityPoint[]): number {
  const total = points.reduce((sum, point) => sum + point.score, 0);
  return total / points.length;
}

/**
 * Round to the one decimal the metrics are reported in, and never return a
 * negative zero: a trend of -0.04 points is zero, not a negative number.
 */
function roundToOneDecimal(value: number): number {
  const rounded = Math.round(value * 10) / 10;
  return Object.is(rounded, -0) ? 0 : rounded;
}
