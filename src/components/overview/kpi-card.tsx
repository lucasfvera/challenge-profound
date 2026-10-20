import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** The unit a KPI is reported in. */
type KpiUnit = "percent" | "position";

/**
 * The metrics the overview reports. They are the glossary's names, so a
 * fourth KPI means a fourth glossary entry.
 */
export type KpiLabel = "Visibility Score" | "Share of Voice" | "Average Position";

/**
 * A KPI card: the metric's name, its value, and its movement over the
 * tracked window.
 *
 * A metric the Snapshot cannot answer renders as an em dash — the design
 * system's rule for a missing metric — and so does a movement with no
 * earlier period to compare. The movement carries its direction in the icon
 * and in the words a screen reader reads, so colour is never the only
 * signal.
 */
export function KpiCard({
  label,
  value,
  unit,
  delta,
}: {
  /** The metric's name, as the glossary spells it. */
  label: KpiLabel;
  /** The metric's value; `null` when the Snapshot cannot answer it. */
  value: number | null;
  /** The unit the metric is reported in. */
  unit: KpiUnit;
  /** The movement over the tracked window; `null` when there is none. */
  delta: number | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {formatValue(value, unit)}
        </p>
        <p className="mt-2 flex items-center gap-1 text-xs leading-4 tabular-nums text-muted-foreground">
          <Trend delta={delta} unit={unit} />
        </p>
      </CardContent>
    </Card>
  );
}

/** The movement of a metric, with its direction spelled out for a reader. */
function Trend({
  delta,
  unit,
}: {
  delta: number | null;
  unit: KpiUnit;
}) {
  if (delta === null) {
    return (
      <>
        <span aria-hidden="true">—</span>
        <span className="sr-only">No earlier period to compare.</span>
      </>
    );
  }

  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
  const Icon =
    direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;

  return (
    <>
      <Icon
        aria-hidden="true"
        className={cn(
          "size-3.5 shrink-0",
          direction === "down" && "text-destructive",
        )}
      />
      <span aria-hidden="true">{formatDelta(delta, unit)}</span>
      <span className="sr-only">{trendText(direction, delta, unit)}</span>
    </>
  );
}

/** The metric's value, in the unit it is reported in. */
function formatValue(value: number | null, unit: KpiUnit): string {
  if (value === null) return "—";

  return unit === "percent" ? `${value.toFixed(1)}%` : value.toFixed(1);
}

/** The movement, in the metric's own unit. */
function formatDelta(delta: number, unit: KpiUnit): string {
  const amount = Math.abs(delta).toFixed(1);

  return unit === "percent" ? `${amount} pts` : `${amount} positions`;
}

/** The movement, spelled out for a screen reader. */
function trendText(
  direction: "up" | "down" | "neutral",
  delta: number,
  unit: KpiUnit,
): string {
  if (direction === "neutral") return "No change over the tracked window.";

  const amount = Math.abs(delta).toFixed(1);
  const unitLabel = unit === "percent" ? "points" : "positions";

  return `${direction === "up" ? "Up" : "Down"} ${amount} ${unitLabel} versus the first half of the tracked window.`;
}
