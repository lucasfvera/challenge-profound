"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, formatDay, formatPeriod } from "@/lib/dates";
import { chartData, snapshot } from "@/lib/snapshot";
import type { Brand, BrandId, ChartRow, PlatformId } from "@/lib/snapshot";
import { cn } from "@/lib/utils";

/**
 * How one series is drawn: its colour token, its line pattern, its weight.
 *
 * The colour is a CSS custom property, so no raw colour reaches the DOM.
 */
interface Treatment {
  /** The chart colour token of the series. */
  color: string;
  /** The line pattern of the series; `undefined` draws a solid line. */
  dash?: string;
  /** The stroke width of the series. */
  width: number;
}

/**
 * The treatment of every brand the Snapshot tracks.
 *
 * The ramp is a property of the brand, not of the Platform: a brand keeps its
 * colour and its line pattern when the reader changes Platform, so the same
 * brand is the same series in every view.
 *
 * The brand the Snapshot measures wears the brand accent and a solid, heavier
 * line. The competitors take the neutral ramp and separate by line pattern, so
 * the series are told apart by treatment and not by hue alone — the rule the
 * design system sets for every chart series. The record is exhaustive: a brand
 * added to the Snapshot has no treatment until the ramp grows one.
 */
const TREATMENTS: Record<BrandId, Treatment> = {
  northstar: { color: "var(--chart-1)", width: 2.5 },
  lumen: { color: "var(--chart-2)", dash: "7 5", width: 2 },
  vantage: { color: "var(--chart-3)", dash: "2 5", width: 2 },
  arcadia: { color: "var(--chart-4)", dash: "9 4 2 4", width: 2 },
};

/**
 * The display names of the tracked Platforms, by Platform id.
 *
 * The Snapshot's Platform list is the only source of a Platform's name, and it
 * holds every Platform the app can select, so the lookup always resolves.
 */
const PLATFORM_NAMES: Record<PlatformId, string> = Object.fromEntries(
  snapshot.platforms.map((platform) => [platform.id, platform.name]),
) as Record<PlatformId, string>;

/** One series of the chart: the brand it draws, and how it is drawn. */
interface DrawnSeries {
  brand: Brand;
  treatment: Treatment;
}

/**
 * The visibility chart: the Visibility Score of Northstar and of the
 * competitors tracked against it, over the tracked window, for the selected
 * Platform.
 *
 * The chart is a client component: the charting library measures its
 * container, so the plot cannot be drawn on the server.
 *
 * The legend is a real control. Every series is a toggle, and a hidden series
 * leaves the plot and the tooltip as well, so the reader compares only the
 * series they kept. The choice survives a change of Platform, so a reader who
 * hid a series keeps it hidden.
 */
export function VisibilityChart({ platformId }: { platformId: PlatformId }) {
  const [hidden, setHidden] = useState<BrandId[]>([]);

  const { series, rows } = chartData(snapshot, platformId);
  const drawn = series.map((brand) => ({
    brand,
    treatment: TREATMENTS[brand.id],
  }));
  const visible = drawn.filter(({ brand }) => !hidden.includes(brand.id));

  function toggle(brandId: BrandId) {
    setHidden((current) =>
      current.includes(brandId)
        ? current.filter((id) => id !== brandId)
        : [...current, brandId],
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility Score</CardTitle>
        <CardDescription>
          {PLATFORM_NAMES[platformId]} · {formatPeriod(snapshot.period)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <NoTrackedWindow />
        ) : (
          <>
            <SeriesLegend
              drawn={drawn}
              hidden={hidden}
              onToggle={toggle}
            />
            {/* The plot keeps at least `h-60` of height below `sm` and grows
                above it, per the responsive conventions. */}
            <div className="mt-4 h-60 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={rows}
                  margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDay}
                    minTickGap={16}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={formatPercent}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--border)" }}
                    content={({ active, label }) => (
                      <VisibilityTooltip
                        active={active}
                        label={label}
                        drawn={visible}
                        rows={rows}
                      />
                    )}
                  />
                  {visible.map(({ brand, treatment }) => (
                    <Line
                      key={brand.id}
                      type="monotone"
                      dataKey={(row: ChartRow) => row.scores[brand.id]}
                      name={brand.name}
                      stroke={treatment.color}
                      strokeWidth={treatment.width}
                      strokeDasharray={treatment.dash}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * The legend: a toggle per series.
 *
 * Each toggle carries `aria-pressed`, so the state of every series is readable
 * without colour.
 */
function SeriesLegend({
  drawn,
  hidden,
  onToggle,
}: {
  drawn: DrawnSeries[];
  hidden: BrandId[];
  onToggle: (brandId: BrandId) => void;
}) {
  return (
    <div role="group" aria-label="Series" className="flex flex-wrap gap-1">
      {drawn.map(({ brand, treatment }) => {
        const shown = !hidden.includes(brand.id);

        return (
          <button
            key={brand.id}
            type="button"
            aria-pressed={shown}
            onClick={() => onToggle(brand.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border border-transparent px-2 py-1 text-xs font-medium transition-colors",
              "hover:not-aria-pressed:bg-muted hover:not-aria-pressed:text-foreground",
              "aria-pressed:bg-secondary aria-pressed:text-foreground",
              !shown && "text-muted-foreground opacity-70",
            )}
          >
            <SeriesMark treatment={treatment} />
            {brand.name}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The chart's tooltip: the tracked score of every visible series on the
 * hovered day.
 *
 * The values are read from the row itself, so the tooltip shows the same
 * tracked score the KPI card shows, and the series are listed in the legend's
 * order rather than in the order the charting library sorts them.
 */
function VisibilityTooltip({
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
        {drawn.map(({ brand, treatment }) => {
          const score = row.scores[brand.id];
          if (score === undefined) return null;

          return (
            <li
              key={brand.id}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="flex items-center gap-2">
                <SeriesMark treatment={treatment} />
                {brand.name}
              </span>
              <span className="tabular-nums">{score.toFixed(1)}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The mark of a series: a short line in the series' own treatment. */
function SeriesMark({ treatment }: { treatment: Treatment }) {
  return (
    <svg
      width="16"
      height="8"
      viewBox="0 0 16 8"
      aria-hidden="true"
      className="shrink-0 overflow-visible"
    >
      <line
        x1="0"
        y1="4"
        x2="16"
        y2="4"
        stroke={treatment.color}
        strokeWidth={treatment.width}
        strokeDasharray={treatment.dash}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The chart's empty state: a Platform the Snapshot does not track a window
 * for.
 *
 * A metric the Snapshot cannot answer renders as an em dash — the design
 * system's rule — and says so to a screen reader.
 */
function NoTrackedWindow() {
  return (
    <p className="text-xs leading-4 text-muted-foreground">
      <span aria-hidden="true">—</span>
      <span className="sr-only">This Platform has no tracked window.</span>
    </p>
  );
}

/** The axis tick of a Visibility Score: `25%`. */
function formatPercent(value: number): string {
  return `${value}%`;
}
