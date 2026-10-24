"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KPIS } from "@/components/overview/kpis";
import { formatMetric, formatMetricValue } from "@/lib/format";
import { platformStandings } from "@/lib/platform-standings";
import type { PlatformStanding } from "@/lib/platform-standings";
import { snapshot } from "@/lib/snapshot";
import type { Platform, PlatformId } from "@/lib/snapshot";

/**
 * The platform standings: the podium of the Platforms, ordered by how often
 * they name the brand.
 *
 * The overview reports everything for one Platform at a time, so nothing on
 * the page said where the brand already shows up well. This card does: one
 * row per Platform, best first, with the place it holds and the Visibility
 * Score it reaches.
 *
 * A row is a control, not a picture: it picks its Platform, and the pick is
 * the selection the platform scope control holds. The card therefore holds
 * no state of its own — it takes the Platform the view is scoped to and
 * hands the picked Platform to the caller, the way the scope control does,
 * so the two can never drift apart.
 *
 * The bar wears the brand accent: the accent is Northstar's data, and the
 * Visibility Score is Northstar's data. The track is a quiet surface, and
 * the number beside the bar is the same number the KPI card reports.
 */
export function PlatformStandings({
  platformId,
  onPlatformChange,
}: {
  /** The Platform the view is scoped to. */
  platformId: PlatformId;
  /** The Platform the reader picked. */
  onPlatformChange: (platform: Platform) => void;
}) {
  const standings = platformStandings(snapshot);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Where your brand stands</CardTitle>
        <CardDescription>
          Northstar&apos;s Visibility Score on each Platform, best first. Pick
          one to scope the view.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* The list is unordered on purpose: the order of the rows is the
            order of the standings, but two Platforms that score the same
            share a place, so a row's place is not the position the list
            announces. The place is in the row. */}
        <ul aria-label="Brand standings" className="flex flex-col gap-2">
          {standings.map((standing) => (
            <li key={standing.platform.id}>
              <Standing
                standing={standing}
                selected={standing.platform.id === platformId}
                onSelect={onPlatformChange}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/**
 * One Platform's row: the place it holds, its name, the bar, and the score.
 *
 * The row is a single-select toggle, the way the scope control's segments
 * are, so it carries `aria-pressed` and the selected chrome. The selected
 * chrome is the secondary fill — a quiet surface, never the brand accent —
 * and the hover of a row that is not selected shifts its own surface, the
 * way the base button's quiet rendering does.
 */
function Standing({
  standing,
  selected,
  onSelect,
}: {
  /** The standing the row shows. */
  standing: PlatformStanding;
  /** Whether the view is scoped to this Platform. */
  selected: boolean;
  /** The Platform the reader picked. */
  onSelect: (platform: Platform) => void;
}) {
  const { platform, place, visibilityScore } = standing;

  return (
    <Button
      type="button"
      variant={selected ? "secondary" : "ghost"}
      aria-pressed={selected}
      aria-label={standingName(standing)}
      onClick={() => {
        // Picking the Platform the view is already scoped to changes
        // nothing, the way the scope control's own segments do.
        if (!selected) onSelect(platform);
      }}
      className="h-auto w-full shrink-0 justify-start gap-3 px-3 py-2"
    >
      <span className="w-4 shrink-0 text-center text-xs tabular-nums text-muted-foreground">
        {place ?? "—"}
      </span>
      <span className="w-24 shrink-0 truncate text-sm text-foreground">
        {platform.name}
      </span>
      <span
        aria-hidden="true"
        // The hook names the bar's track, so the smoke suite can hold that
        // the four bars keep the same width — the podium compares only if
        // they do.
        data-standing-bar
        className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted"
      >
        {visibilityScore !== null && (
          <span
            className="block h-2 rounded-full bg-accent"
            style={{ width: `${visibilityScore}%` }}
          />
        )}
      </span>
      <span className="w-14 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
        {formatMetricValue(visibilityScore, KPIS.visibilityScore.unit)}
      </span>
    </Button>
  );
}

/**
 * The name a screen reader reads for a standing.
 *
 * The name says which Platform the row is, the place it holds, and what the
 * number measures, so the number is never a percentage without a name. A
 * Platform the Snapshot cannot score says so in words, the way the design
 * system reserves the em dash for it.
 */
function standingName(standing: PlatformStanding): string {
  const { platform, place, visibilityScore } = standing;

  const held = place === null ? "no place" : `place ${place}`;

  const score =
    visibilityScore === null
      ? `no ${KPIS.visibilityScore.label}`
      : `${formatMetric(visibilityScore, KPIS.visibilityScore.unit)} ${KPIS.visibilityScore.label}`;

  return `${platform.name}, ${held}, ${score}`;
}
