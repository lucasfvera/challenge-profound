import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMetric } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The metrics the overview reports, with the unit each one is reported in.
 *
 * They are the glossary's names, and each name comes with its own unit, so
 * a fourth KPI means a fourth glossary entry.
 */
export type Kpi =
  | { label: "Visibility Score"; unit: "percent" }
  | { label: "Share of Voice"; unit: "percent" }
  | { label: "Average Position"; unit: "position" };

/** The direction a metric moved in. */
type Direction = "up" | "down" | "neutral";

/**
 * A KPI card: the metric's name, its value, and its movement over the
 * tracked window.
 *
 * A metric the Snapshot cannot answer renders as an em dash — the design
 * system's rule for a missing metric — and so does a movement with no
 * earlier period to compare. The movement carries its direction in the
 * words, so colour is never the only signal.
 */
export function KpiCard({
  kpi,
  value,
  delta,
}: {
  /** The metric, with the unit it is reported in. */
  kpi: Kpi;
  /** The metric's value; `null` when the Snapshot cannot answer it. */
  value: number | null;
  /** The movement over the tracked window; `null` when there is none. */
  delta: number | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {kpi.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {formatValue(value, kpi.unit)}
        </p>
        <Trend delta={delta} unit={kpi.unit} />
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
  unit: Kpi["unit"];
}) {
  if (delta === null) {
    return (
      <p className="mt-2 text-xs leading-4 tabular-nums text-muted-foreground">
        <span aria-hidden="true">—</span>
        <span className="sr-only">No earlier period to compare.</span>
      </p>
    );
  }

  const direction: Direction = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
  const amount = Math.abs(delta).toFixed(1);

  return (
    <p
      className={cn(
        "mt-2 text-xs leading-4 tabular-nums text-muted-foreground",
        direction === "down" && "text-destructive",
      )}
    >
      <span aria-hidden="true">{formatDelta(direction, amount, unit)}</span>
      <span className="sr-only">{trendText(direction, amount, unit)}</span>
    </p>
  );
}

/** The metric's value, in the unit it is reported in. */
function formatValue(value: number | null, unit: Kpi["unit"]): string {
  if (value === null) return "—";

  return formatMetric(value, unit);
}

/** The movement, in the metric's own unit. */
function formatDelta(
  direction: Direction,
  amount: string,
  unit: Kpi["unit"],
): string {
  if (direction === "neutral") return "No change";

  const unitLabel = unit === "percent" ? "pts" : "positions";

  return `${direction === "up" ? "Up" : "Down"} ${amount} ${unitLabel}`;
}

/** The movement, spelled out for a screen reader. */
function trendText(
  direction: Direction,
  amount: string,
  unit: Kpi["unit"],
): string {
  if (direction === "neutral") return "No change over the tracked window.";

  const unitLabel = unit === "percent" ? "points" : "positions";

  return `${direction === "up" ? "Up" : "Down"} ${amount} ${unitLabel} versus the first half of the tracked window.`;
}
