import { ArrowDown, ArrowUp, Info, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Kpi } from "@/components/overview/kpis";
import { formatMetric } from "@/lib/format";
import { cn } from "@/lib/utils";

/** The direction a metric moved in. */
type Direction = "up" | "down" | "neutral";

/**
 * The mark each direction is drawn with, and the word that names it.
 *
 * The arrow is the shape of the movement, so the direction is readable
 * without the colour: the words say it, the arrow shows it, and the colour
 * says which way the reader should read it. The mark carries the word as
 * its accessible name, so it is not a decoration a screen reader skips, and
 * the mark and the word are bound together in one place.
 */
const MARKS = {
  up: { Icon: ArrowUp, name: "Up" },
  down: { Icon: ArrowDown, name: "Down" },
  neutral: { Icon: Minus, name: "No change" },
} as const;

/**
 * A KPI card: the metric's name, its value, and its movement over the
 * tracked window.
 *
 * The name is a label with an explanation behind it: the information icon
 * beside the name opens the metric's explanation, so a reader who does not
 * know what the metric measures can ask. The popover opens on a hover, on a
 * click and on a tap, so it is reachable whichever way the reader arrives —
 * a hover-only overlay would answer nobody on a phone.
 *
 * A metric the Snapshot cannot answer renders as an em dash — the design
 * system's rule for a missing metric — and so does a movement with no
 * earlier period to compare. The movement carries its direction in the mark,
 * in the words and in the colour, so colour is never the only signal.
 */
export function KpiCard({
  kpi,
  value,
  delta,
}: {
  /** The metric, with the unit it is reported in and its explanation. */
  kpi: Kpi;
  /** The metric's value; `null` when the Snapshot cannot answer it. */
  value: number | null;
  /** The movement over the tracked window; `null` when there is none. */
  delta: number | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {kpi.label}
          <Popover>
            <PopoverTrigger
              openOnHover
              aria-label={`What ${kpi.label} means`}
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm"
            >
              <Info aria-hidden="true" className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent side="top">
              <PopoverTitle className="sr-only">{kpi.label}</PopoverTitle>
              <PopoverDescription>{kpi.description}</PopoverDescription>
            </PopoverContent>
          </Popover>
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
  const { Icon, name } = MARKS[direction];

  return (
    <p
      className={cn(
        "mt-2 flex items-center gap-1 text-xs leading-4 tabular-nums text-muted-foreground",
        direction === "up" && "text-positive",
        direction === "down" && "text-destructive",
      )}
    >
      <Icon role="img" aria-label={name} className="size-3 shrink-0" />
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
  if (direction === "neutral") return MARKS.neutral.name;

  const unitLabel = unit === "percent" ? "pts" : "positions";

  return `${MARKS[direction].name} ${amount} ${unitLabel}`;
}

/** The movement, spelled out for a screen reader. */
function trendText(
  direction: Direction,
  amount: string,
  unit: Kpi["unit"],
): string {
  if (direction === "neutral") return "No change over the tracked window.";

  const unitLabel = unit === "percent" ? "points" : "positions";

  return `${MARKS[direction].name} ${amount} ${unitLabel} versus the first half of the tracked window.`;
}
