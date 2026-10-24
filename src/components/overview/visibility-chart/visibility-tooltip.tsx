import { SeriesMark } from "@/components/overview/visibility-chart/series-mark";
import type { DrawnSeries } from "@/components/overview/visibility-chart/treatment";
import { formatDate } from "@/lib/dates";
import { formatMetric } from "@/lib/format";
import type { ChartRow } from "@/lib/snapshot";

/**
 * The chart's tooltip: the tracked score of every visible series on the
 * hovered day.
 *
 * The values are read from the row itself, so the tooltip shows the same
 * tracked score the KPI card shows, and the series are listed in the legend's
 * order rather than in the order the charting library sorts them.
 */
export function VisibilityTooltip({
  active,
  label,
  drawn,
  rows,
}: {
  active: boolean;
  label: string | number | undefined;
  drawn: DrawnSeries[];
  rows: ChartRow[];
}) {
  if (!active || typeof label !== "string") return null;

  const row = rows.find((entry) => entry.date === label);
  if (!row) return null;

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="text-xs font-medium text-muted-foreground">
        {formatDate(row.date)}
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {drawn.map((series) => {
          const score = row.scores[series.brand.id];
          if (score === undefined) return null;

          return (
            <li
              key={series.brand.id}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="flex items-center gap-2">
                <SeriesMark series={series} />
                {series.brand.name}
              </span>
              <span className="tabular-nums">
                {formatMetric(score, "percent")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
