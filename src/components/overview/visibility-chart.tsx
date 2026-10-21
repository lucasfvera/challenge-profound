"use client";

import { useId, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { formatDate, formatDay, formatPeriod } from "@/lib/dates";
import { formatMetric, formatPercentTick } from "@/lib/format";
import { chartData, snapshot } from "@/lib/snapshot";
import type { Brand, BrandId, ChartRow, PlatformId } from "@/lib/snapshot";

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
 * Northstar — the brand the Snapshot measures — wears the brand accent on a
 * solid line that is heavier than any competitor wears: the line the reader
 * is looking for is the heaviest one on the plot, and weight is the signal
 * that survives a greyscale plot, a projector and a phone. The competitors
 * wear colours of their own — amber, teal, orchid — and separate by line
 * pattern as well, so the series are told apart by colour and by treatment,
 * never by hue alone — the rule the design system sets for every chart
 * series. The patterns are as distinct from each other as three patterns can
 * be at two pixels: a long dash, a fine dot, and a dash-dot. The record is
 * exhaustive: a brand added to the Snapshot has no treatment until the ramp
 * grows one.
 */
const TREATMENTS: Record<BrandId, Treatment> = {
  northstar: { color: "var(--chart-1)", width: 3.5 },
  lumen: { color: "var(--chart-2)", dash: "10 6", width: 2 },
  vantage: { color: "var(--chart-3)", dash: "1 6", width: 2 },
  arcadia: { color: "var(--chart-4)", dash: "12 5 2 5", width: 2 },
};

/**
 * The display names of the tracked Platforms, by Platform id.
 *
 * The Snapshot's Platform list is the only source of a Platform's name, and it
 * holds every Platform the app can select.
 */
const PLATFORM_NAMES = new Map(
  snapshot.platforms.map((platform) => [platform.id, platform.name] as const),
);

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
 * hid a series keeps it hidden. The toggles are grouped into the brand the
 * reader is measuring and the competitors it is measured against, so the
 * brand is told from the rivals in words and not only by its colour.
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

  const platformName = PLATFORM_NAMES.get(platformId) ?? "—";
  const seriesNames = series.map((brand) => brand.name).join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility Score</CardTitle>
        <CardDescription>
          {platformName} · {formatPeriod(snapshot.period)}
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
                  role="img"
                  accessibilityLayer={false}
                  aria-label={`Visibility Score of ${seriesNames} on ${platformName}, over the tracked window`}
                  desc={`A line chart of the Visibility Score of every brand on each tracked day of the window, from ${formatDay(snapshot.period.start)} to ${formatDay(snapshot.period.end)}. The vertical axis runs from 0 to 100 percent.`}
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
                    tickFormatter={formatPercentTick}
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
                      stroke={treatment.color}
                      strokeWidth={treatment.width}
                      strokeDasharray={treatment.dash}
                      strokeLinecap="round"
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
 * The legend: a toggle per series, grouped into the brand the reader is
 * measuring and the competitors it is measured against.
 *
 * The groups are named by the labels they show, so the brand is named in
 * words — to a reader and to a screen reader — and not only by the colour of
 * its line.
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
  const brandSeries = drawn.filter(
    ({ brand }) => brand.kind === "subject",
  );
  const competitorSeries = drawn.filter(
    ({ brand }) => brand.kind === "competitor",
  );

  return (
    <div role="group" aria-label="Series" className="flex flex-col gap-2">
      <SeriesGroup
        label="Your brand"
        drawn={brandSeries}
        hidden={hidden}
        onToggle={onToggle}
      />
      <SeriesGroup
        label="Competitors"
        drawn={competitorSeries}
        hidden={hidden}
        onToggle={onToggle}
      />
    </div>
  );
}

/**
 * One group of series: the label that names it, and the toggles it holds.
 *
 * The group is named by the label it shows, so the words a reader reads are
 * the words a screen reader reads, and the brand is told from the competitors
 * without colour.
 */
function SeriesGroup({
  label,
  drawn,
  hidden,
  onToggle,
}: {
  label: string;
  drawn: DrawnSeries[];
  hidden: BrandId[];
  onToggle: (brandId: BrandId) => void;
}) {
  const labelId = useId();

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className="flex flex-wrap items-center gap-2"
    >
      <span
        id={labelId}
        className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </span>
      {drawn.map((series) => (
        <SeriesToggle
          key={series.brand.id}
          series={series}
          shown={!hidden.includes(series.brand.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

/**
 * One series' toggle: the reference it wears, and its name.
 *
 * The toggle is the base button in its selected and its quiet rendering, so
 * the legend holds no chrome of its own. Each toggle carries `aria-pressed`,
 * so the state of every series is readable without colour.
 */
function SeriesToggle({
  series,
  shown,
  onToggle,
}: {
  series: DrawnSeries;
  shown: boolean;
  onToggle: (brandId: BrandId) => void;
}) {
  return (
    <Button
      type="button"
      variant={shown ? "secondary" : "ghost"}
      size="sm"
      aria-pressed={shown}
      onClick={() => onToggle(series.brand.id)}
      className={shown ? "gap-2" : "gap-2 text-muted-foreground"}
    >
      <SeriesMark treatment={series.treatment} />
      {series.brand.name}
    </Button>
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

/**
 * The size of a series reference, in pixels.
 *
 * The reference has to carry a whole dash pattern: the longest cycle is the
 * dash-dot's, 24px, so a sample narrower than that would cut its dot off and
 * the reference would no longer tell that series from the long dash.
 *
 * The size is written twice — in the class, which is what the sample is drawn
 * at, and in the viewBox, which is the space the dash is drawn in — and the
 * two have to agree: the sample has to be drawn at the scale it declares, or
 * the dash it shows is not the dash the plot draws.
 */
const REFERENCE_WIDTH = 28;
const REFERENCE_HEIGHT = 10;

/**
 * The reference of a series: a sample of the line it names.
 *
 * The sample is drawn with the series' own stroke width and its own dash, so
 * the reference in the legend and in the tooltip shows the treatment the plot
 * draws — only shorter. A reference too short to carry the dash cannot tell
 * two series apart.
 */
function SeriesMark({ treatment }: { treatment: Treatment }) {
  return (
    <svg
      width={REFERENCE_WIDTH}
      height={REFERENCE_HEIGHT}
      viewBox={`0 0 ${REFERENCE_WIDTH} ${REFERENCE_HEIGHT}`}
      aria-hidden="true"
      // The Button sizes every icon it holds to its own size, and the
      // reference is not an icon: it is a sample of a line, and the Button's
      // rule would shrink it to half the scale the plot draws it at. A class
      // carrying `size-` is the escape hatch the Button leaves.
      className="size-[28px_10px] shrink-0 overflow-visible"
    >
      <line
        x1="0"
        y1={REFERENCE_HEIGHT / 2}
        x2={REFERENCE_WIDTH}
        y2={REFERENCE_HEIGHT / 2}
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
