import { platformMetrics, subjectBrand } from "@/lib/snapshot";
import { platformById } from "@/lib/snapshot/platforms";
import type { Platform, Snapshot } from "@/lib/snapshot";

/**
 * The platform standings contract: the podium's read of the Snapshot.
 *
 * The standings rank the Platforms by how often the brand the Snapshot
 * measures shows up in their Answers — the Visibility Score, the same number
 * the KPI card reports for the Platform the view is scoped to. The podium and
 * the card therefore cannot disagree about a Platform: both read the same
 * derivation, and neither measures anything on its own.
 *
 * The ranking is a reading, not a second measurement. A Platform the Snapshot
 * cannot score is not ranked at all, so the podium never shows a zero where
 * the data has no answer.
 */

/**
 * One Platform's standing: how often the brand shows up in its Answers, and
 * the place that puts it in the ranking.
 */
export interface PlatformStanding {
  /** The Platform the standing belongs to. */
  platform: Platform;
  /**
   * Visibility Score: the percentage of tracked Prompts whose Answer on the
   * Platform contains at least one Mention of the brand the Snapshot
   * measures.
   *
   * `null` when the Snapshot cannot report one — the Platform gave no
   * Answer, or the Snapshot measures no brand.
   */
  visibilityScore: number | null;
  /**
   * The place the Platform holds in the ranking, 1 being the best.
   *
   * `null` when the Platform has no score to rank by.
   */
  rank: number | null;
}

/**
 * The standings of every tracked Platform, best first.
 *
 * The order is the Visibility Score, highest first. Platforms that score the
 * same keep the Snapshot's Platform order, so the podium reads the same on
 * every render and needs nothing from the reader to be ordered.
 *
 * A Platform the Snapshot cannot score sorts last and is not ranked: the
 * design system shows the em dash for a metric the data cannot answer, and
 * a zero here would read as a measurement.
 */
export function platformStandings(snapshot: Snapshot): PlatformStanding[] {
  const brand = subjectBrand(snapshot);
  const metrics = platformMetrics(snapshot);

  const standings: PlatformStanding[] = metrics.map((entry) => {
    const subject = entry.brands.find(
      (candidate) => candidate.brandId === brand?.id,
    );

    return {
      platform: platformById(entry.platformId),
      visibilityScore: subject?.visibilityScore ?? null,
      rank: null,
    };
  });

  return rankStandings(standings);
}

/**
 * The standings in ranking order, each with the place it holds.
 *
 * Equal scores share the place, and the place after them skips the ones they
 * took: 1, 1, 3. The number beside a row is therefore the place the row
 * holds and not its index in the list.
 */
function rankStandings(standings: PlatformStanding[]): PlatformStanding[] {
  const ordered = [...standings].sort(byScore);

  let rank = 0;
  let previous: PlatformStanding | undefined;

  return ordered.map((standing, index) => {
    const score = standing.visibilityScore;

    // A Platform with no score has no place: it sorts last and the design
    // system shows the em dash for it.
    if (score === null) return { ...standing, rank: null };

    const tied = previous?.visibilityScore === score;
    if (!tied) rank = index + 1;

    const ranked = { ...standing, rank };
    previous = ranked;

    return ranked;
  });
}

/**
 * The order two standings are compared by: the higher score first, and a
 * Platform with no score last.
 */
function byScore(left: PlatformStanding, right: PlatformStanding): number {
  const leftScore = left.visibilityScore;
  const rightScore = right.visibilityScore;

  if (leftScore === null) return rightScore === null ? 0 : 1;
  if (rightScore === null) return -1;

  return rightScore - leftScore;
}
