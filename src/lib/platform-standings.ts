import { subjectPlatformMetrics } from "@/lib/snapshot";
import { platformById } from "@/lib/snapshot/platforms";
import type { Platform, Snapshot } from "@/lib/snapshot";

/**
 * The platform standings contract: the podium's read of the Snapshot.
 *
 * The standings order the Platforms by how often the brand the Snapshot
 * measures shows up in their Answers — the Visibility Score, the same number
 * the KPI card reports for the Platform the view is scoped to. The podium and
 * the card therefore cannot disagree about a Platform: both read the same
 * derivation, and neither measures anything on its own.
 *
 * The order is a reading, not a second measurement. A Platform the Snapshot
 * cannot score is not placed at all, so the podium never shows a zero where
 * the data has no answer.
 */

/**
 * One Platform's standing: how often the brand shows up in its Answers, and
 * the place that puts it in the standings.
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
   * The place the Platform holds in the standings, 1 being the best.
   *
   * `null` when the Platform has no score to be placed by.
   */
  place: number | null;
}

/**
 * The standings of every tracked Platform, best first.
 *
 * The order is the Visibility Score, highest first. Platforms that score the
 * same keep the Snapshot's Platform order, so the podium reads the same on
 * every render and needs nothing from the reader to be ordered.
 *
 * A Platform the Snapshot cannot score sorts last and is not placed: the
 * design system shows the em dash for a metric the data cannot answer, and
 * a zero here would read as a measurement.
 */
export function platformStandings(snapshot: Snapshot): PlatformStanding[] {
  const standings: PlatformStanding[] = subjectPlatformMetrics(snapshot).map(
    (entry) => ({
      platform: platformById(entry.platformId),
      visibilityScore: entry.visibilityScore,
      place: null,
    }),
  );

  return withPlaces(standings);
}

/**
 * The standings in order, each with the place it holds.
 *
 * Equal scores share the place, and the place after them skips the ones they
 * took: 1, 1, 3. The number beside a row is therefore the place the row
 * holds and not its index in the list.
 */
function withPlaces(standings: PlatformStanding[]): PlatformStanding[] {
  const ordered = [...standings].sort(byScore);

  let place = 0;
  let previous: PlatformStanding | undefined;

  return ordered.map((standing, index) => {
    const score = standing.visibilityScore;

    // A Platform with no score has no place: it sorts last and the design
    // system shows the em dash for it.
    if (score === null) return { ...standing, place: null };

    const tied = previous?.visibilityScore === score;
    if (!tied) place = index + 1;

    const placed = { ...standing, place };
    previous = placed;

    return placed;
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
