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
 * One tracked day of the chart: the Visibility Score of every brand tracked on
 * that day.
 */
export interface ChartRow {
  /** The tracked day, as an ISO date (`YYYY-MM-DD`). */
  date: string;
  /**
   * The Visibility Score of each brand tracked on that day, by brand id.
   *
   * A brand that was not tracked on the day has no entry at all: never `0`,
   * which would read as a real measurement, and never `NaN`.
   */
  scores: Partial<Record<BrandId, number>>;
}

/**
 * The chart's data: the series it draws, and the tracked days it draws them
 * from.
 */
export interface ChartData {
  /**
   * The series: the brands the platform tracks, the brand the Snapshot measures
   * first. Each one carries the display name the legend and the tooltip show.
   */
  series: Brand[];
  /** One row per tracked day, in ascending date order. */
  rows: ChartRow[];
}

/**
 * The chart's data for one platform: the series it draws and the tracked days
 * it draws them from.
 *
 * The series are the brands that platform tracks — the brand the Snapshot
 * measures first, then the competitors in the Snapshot's brand order. The rows
 * are the union of the tracked days, in ascending date order; a brand that was
 * not tracked on a day leaves its score out of that day's row.
 *
 * The rows carry the tracked scores verbatim, so the chart and the KPI cards
 * cannot disagree about the same day.
 */
export function chartData(snapshot: Snapshot, platformId: PlatformId): ChartData {
  const tracked = platformSeries(snapshot, platformId);
  const brands = trackedBrands(snapshot, tracked);
  const brandIds = new Set(brands.map((brand) => brand.id));

  return {
    series: brands,
    rows: chartRows(tracked, brandIds),
  };
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
  return roundToOneDecimal(mean(scoresOf(points)));
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
  return periodTrend(scoresOf(points));
}

/**
 * The period-over-period movement of the brand's Share of Voice across a
 * tracked window.
 *
 * A tracked day's Share of Voice is the brand's share of the tracked Mentions
 * of that day. The Snapshot tracks the Visibility Scores rather than the
 * Mentions, and a score counts the tracked Prompts whose Answer mentions the
 * brand once — so the score-derived share equals the mention share while no
 * Answer names a brand twice, which the fixture holds. The trend compares the
 * two halves of the window, the way `visibilityTrend` compares the two halves
 * of the Visibility Score.
 *
 * `null` when the window holds nothing to compare.
 */
export function shareOfVoiceTrend(
  snapshot: Snapshot,
  brandId: BrandId,
  platformId: PlatformId,
): number | null {
  return periodTrend(dailyShareOfVoice(snapshot, brandId, platformId));
}

/**
 * The metrics of the brand the Snapshot measures on one platform, with the
 * movements the tracked window can answer.
 *
 * The Average Position has no movement: the Snapshot tracks no daily mention
 * positions, so there is no earlier period to compare it with.
 */
export interface SubjectMetrics {
  /** Visibility Score: the percentage of tracked Prompts whose Answer mentions the brand. */
  visibilityScore: number | null;
  /** Share of Voice: the brand's Mentions as a percentage of all brand Mentions. */
  shareOfVoice: number | null;
  /** Average Position: the mean ordinal position of the brand's first Mention. */
  averagePosition: number | null;
  /** The movement of the Visibility Score over the tracked window. */
  visibilityTrend: number | null;
  /** The movement of the Share of Voice over the tracked window. */
  shareOfVoiceTrend: number | null;
  /** The movement of the Average Position; the Snapshot tracks no daily positions. */
  averagePositionTrend: number | null;
}

/**
 * The brand the Snapshot measures: the one it marks as the subject.
 *
 * It is the brand the dashboard reports on — the KPI cards and the prompt
 * table read it from here, so the two cannot disagree about whose Mentions
 * they count.
 *
 * `undefined` when the Snapshot marks no brand as the subject.
 */
export function subjectBrand(snapshot: Snapshot): Brand | undefined {
  return snapshot.brands.find((entry) => entry.kind === "subject");
}

/**
 * The metrics of the brand the Snapshot measures on one platform.
 *
 * The measured brand is the one the Snapshot marks as the subject. Its
 * movements come from the tracked window, so they are `null` when the window
 * cannot answer them.
 */
export function subjectMetrics(
  snapshot: Snapshot,
  platformId: PlatformId,
): SubjectMetrics {
  const brand = subjectBrand(snapshot);
  if (!brand) {
    return {
      visibilityScore: null,
      shareOfVoice: null,
      averagePosition: null,
      visibilityTrend: null,
      shareOfVoiceTrend: null,
      averagePositionTrend: null,
    };
  }

  const metrics = subjectPlatformMetrics(snapshot).find(
    (entry) => entry.platformId === platformId,
  );

  return {
    visibilityScore: metrics?.visibilityScore ?? null,
    shareOfVoice: metrics?.shareOfVoice ?? null,
    averagePosition: metrics?.averagePosition ?? null,
    visibilityTrend: visibilityTrend(seriesPoints(snapshot, brand.id, platformId)),
    shareOfVoiceTrend: shareOfVoiceTrend(snapshot, brand.id, platformId),
    averagePositionTrend: null,
  };
}

/**
 * The metrics of the brand the Snapshot measures, for every tracked Platform.
 */
export interface SubjectPlatformMetrics {
  /** The Platform the metrics belong to. */
  platformId: PlatformId;
  /** Visibility Score: the percentage of tracked Prompts whose Answer names the brand. */
  visibilityScore: number | null;
  /** Share of Voice: the brand's Mentions as a percentage of all brand Mentions. */
  shareOfVoice: number | null;
  /** Average Position: the mean ordinal position of the brand's first Mention. */
  averagePosition: number | null;
}

/**
 * The metrics of the brand the Snapshot measures, for every tracked Platform.
 *
 * The KPI cards report the brand's metrics for the Platform the view is
 * scoped to, and the podium orders the Platforms by the same numbers, so the
 * read lives here once: the two cannot disagree about a Platform, because
 * they read the same measurement.
 */
export function subjectPlatformMetrics(
  snapshot: Snapshot,
): SubjectPlatformMetrics[] {
  const brand = subjectBrand(snapshot);
  const metrics = platformMetrics(snapshot);

  return metrics.map((entry) => {
    const subject = entry.brands.find(
      (candidate) => candidate.brandId === brand?.id,
    );

    return {
      platformId: entry.platformId,
      visibilityScore: subject?.visibilityScore ?? null,
      shareOfVoice: subject?.shareOfVoice ?? null,
      averagePosition: subject?.averagePosition ?? null,
    };
  });
}

/**
 * The brands one platform tracks, the brand the Snapshot measures first and the
 * competitors after it in the Snapshot's brand order.
 */
function trackedBrands(snapshot: Snapshot, tracked: VisibilitySeries[]): Brand[] {
  const trackedIds = new Set(tracked.map((entry) => entry.brandId));
  const brands = snapshot.brands.filter((brand) => trackedIds.has(brand.id));

  const measured = brands.filter((brand) => brand.kind === "subject");
  const competitors = brands.filter((brand) => brand.kind === "competitor");

  return [...measured, ...competitors];
}

/**
 * One row per tracked day of one platform, in ascending date order.
 *
 * A series whose brand is not one of the platform's brands is left out: the
 * chart draws no line for it, so the row must not carry a score for it either.
 */
function chartRows(
  tracked: VisibilitySeries[],
  brandIds: ReadonlySet<BrandId>,
): ChartRow[] {
  const rows = new Map<string, ChartRow>();

  for (const series of tracked) {
    if (!brandIds.has(series.brandId)) continue;

    for (const point of series.points) {
      const row: ChartRow = rows.get(point.date) ?? {
        date: point.date,
        scores: {},
      };
      row.scores[series.brandId] = point.score;
      rows.set(point.date, row);
    }
  }

  return [...rows.values()].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
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

/**
 * The position of the brand's first Mention in one Answer.
 *
 * The lowest ordinal of the brand's Mentions in the Answer: 1 means the
 * brand was named first. `null` when the Answer does not name the brand.
 *
 * The Average Position averages these positions, so the prompt table's
 * indicator and the KPI card report the same number seen per Answer.
 */
export function firstMentionPosition(
  answer: Answer,
  brands: Brand[],
  brandId: BrandId,
): number | null {
  return firstPosition(mentionsOf([answer], brands)[0], brandId);
}

/**
 * The position of the brand's first Mention in one Answer's mentions.
 *
 * The lowest ordinal of the brand's Mentions: 1 means the brand was named
 * first. `null` when the Answer does not name the brand.
 */
function firstPosition(
  mentions: BrandMention[],
  brandId: BrandId,
): number | null {
  const ordinals = mentions
    .filter((mention) => mention.brandId === brandId)
    .map((mention) => mention.ordinal);

  if (ordinals.length === 0) return null;

  return Math.min(...ordinals);
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
    .map((list) => firstPosition(list, brandId))
    .filter((position): position is number => position !== null);

  if (firstPositions.length === 0) return null;

  const total = firstPositions.reduce((sum, position) => sum + position, 0);

  return roundToOneDecimal(total / firstPositions.length);
}

/** The scores of a tracked window, in the order the days were tracked. */
function scoresOf(points: VisibilityPoint[]): number[] {
  return points.map((point) => point.score);
}

/**
 * The brand's Share of Voice on every tracked day of a platform, as a
 * percentage of the tracked Scores of that day.
 *
 * The Snapshot tracks Scores rather than Mentions, so this is the score-
 * derived share of voice; `shareOfVoiceTrend` spells out when the two
 * agree.
 */
function dailyShareOfVoice(
  snapshot: Snapshot,
  brandId: BrandId,
  platformId: PlatformId,
): number[] {
  const totals = new Map<string, number>();
  const own = new Map<string, number>();

  for (const series of platformSeries(snapshot, platformId)) {
    for (const point of series.points) {
      totals.set(point.date, (totals.get(point.date) ?? 0) + point.score);
      if (series.brandId === brandId) own.set(point.date, point.score);
    }
  }

  return [...own.entries()].map(([date, score]) => {
    const total = totals.get(date) ?? 0;

    // A tracked day nobody was mentioned on leaves every brand without a
    // share of voice. The day stays in the window, so both halves of the
    // comparison cover the same days.
    return total > 0 ? (score / total) * 100 : 0;
  });
}

/**
 * The period-over-period movement of a tracked window of values: the mean of
 * its second half minus the mean of its first half.
 *
 * `null` when there is nothing to compare — a window of one day or less.
 */
function periodTrend(values: number[]): number | null {
  if (values.length < 2) return null;

  const split = Math.floor(values.length / 2);
  const earlier = values.slice(0, split);
  const later = values.slice(split);

  return roundToOneDecimal(mean(later) - mean(earlier));
}

/** The mean of a list of values. */
function mean(values: number[]): number {
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

/**
 * Round to the one decimal the metrics are reported in, and never return a
 * negative zero: a trend of -0.04 points is zero, not a negative number.
 */
function roundToOneDecimal(value: number): number {
  const rounded = Math.round(value * 10) / 10;
  return Object.is(rounded, -0) ? 0 : rounded;
}
