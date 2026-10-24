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
import { NoTrackedWindow } from "@/components/overview/visibility-chart/no-tracked-window";
import { SeriesLegend } from "@/components/overview/visibility-chart/series-legend";
import {
  TREATMENTS,
  type DrawnSeries,
} from "@/components/overview/visibility-chart/treatment";
import { VisibilityTooltip } from "@/components/overview/visibility-chart/visibility-tooltip";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch, SwitchThumb } from "@/components/ui/switch";
import { formatDay, formatPeriod } from "@/lib/dates";
import { formatPercentTick } from "@/lib/format";
import { chartData, snapshot } from "@/lib/snapshot";
import type { BrandId, ChartRow, PlatformId } from "@/lib/snapshot";

/**
 * The display names of the tracked Platforms, by Platform id.
 *
 * The Snapshot's Platform list is the only source of a Platform's name, and it
 * holds every Platform the app can select.
 */
const PLATFORM_NAMES = new Map(
  snapshot.platforms.map((platform) => [platform.id, platform.name] as const),
);

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
 *
 * The greyscale mode takes the hue off the competitors and leaves the brand
 * alone, so the brand's line is the one hue on the plot — the reader's way of
 * asking for their own line and nothing else. The mode is a chart control,
 * not a series toggle, so it sits in the card's action slot and the legend
 * still holds nothing but the series.
 */
export function VisibilityChart({ platformId }: { platformId: PlatformId }) {
  const [hidden, setHidden] = useState<BrandId[]>([]);
  const [greyscale, setGreyscale] = useState(false);

  const { series, rows } = chartData(snapshot, platformId);
  const drawn: DrawnSeries[] = series.map((brand) => {
    const { color, grey, ...treatment } = TREATMENTS[brand.id];

    return {
      brand,
      ...treatment,
      color: greyscale ? grey : color,
    };
  });
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
        <CardAction>
          {/* The mode is on or off, so it is a switch and not a button: the
              control says so itself, and the reader sees the state without
              reading a word. The label names the mode, not what it does to
              the competitors — the brand that keeps its colour is the point
              of it, and the reader is looking at the plot. */}
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Switch
              checked={greyscale}
              onCheckedChange={(checked) => setGreyscale(checked)}
            >
              <SwitchThumb />
            </Switch>
            Greyscale
          </label>
        </CardAction>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <NoTrackedWindow />
        ) : (
          <>
            <SeriesLegend drawn={drawn} hidden={hidden} onToggle={toggle} />
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
                  {visible.map((series) => (
                    <Line
                      key={series.brand.id}
                      type="monotone"
                      dataKey={(row: ChartRow) => row.scores[series.brand.id]}
                      stroke={series.color}
                      strokeWidth={series.width}
                      strokeDasharray={series.dash}
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
