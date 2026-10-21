"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { SeriesMark } from "@/components/overview/visibility-chart/series-mark";
import type { DrawnSeries } from "@/components/overview/visibility-chart/treatment";
import type { BrandId } from "@/lib/snapshot";

/**
 * The legend: a toggle per series, grouped into the brand the reader is
 * measuring and the competitors it is measured against.
 *
 * The groups are named by the labels they show, so the brand is named in
 * words — to a reader and to a screen reader — and not only by the colour of
 * its line.
 */
export function SeriesLegend({
  drawn,
  hidden,
  onToggle,
}: {
  drawn: DrawnSeries[];
  hidden: BrandId[];
  onToggle: (brandId: BrandId) => void;
}) {
  const brandSeries = drawn.filter(({ brand }) => brand.kind === "subject");
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
      <SeriesMark series={series} />
      {series.brand.name}
    </Button>
  );
}
