import type { Brand, BrandId } from "@/lib/snapshot";

/**
 * A chart colour token.
 *
 * The series colours are CSS custom properties, so no raw colour reaches the
 * DOM. The type makes that rule checkable rather than a convention: a hex
 * at a call site does not compile.
 */
type ChartToken = `var(--chart-${string})`;

/**
 * How one series is drawn: its colour tokens, its line pattern, its weight.
 */
interface Treatment {
  /** The chart colour token of the series, in the colour mode. */
  color: ChartToken;
  /**
   * The chart colour token of the series in the greyscale mode.
   *
   * The brand's is its own colour: the mode takes the hue off the competitors
   * only, so the brand's line is the one hue left on the plot, and that is
   * what makes the mode worth switching on.
   */
  grey: ChartToken;
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
 * solid line that is heavier than any competitor wears: the line the
 * reader is looking for is the heaviest one on the plot, and weight is the
 * signal that survives a greyscale plot, a projector and a phone. The
 * competitors wear colours of their own — amber, teal, orchid — and separate
 * by line pattern as well, so the series are told apart by colour and by
 * treatment, never by hue alone — the rule the design system sets for every
 * chart series. The patterns are as distinct from each other as three
 * patterns can be at the weight the competitors wear: a long dash, a fine
 * dot, and a dash-dot.
 * The record is exhaustive: a brand added to the Snapshot has no treatment
 * until the ramp grows one.
 *
 * Every treatment names the colour it wears in each mode, and the brand's
 * greyscale colour is its own: the greyscale mode takes the hue off the
 * competitors and leaves the brand alone.
 */
export const TREATMENTS: Record<BrandId, Treatment> = {
  northstar: {
    color: "var(--chart-1)",
    grey: "var(--chart-1)",
    width: 4,
  },
  lumen: {
    color: "var(--chart-2)",
    grey: "var(--chart-2-grey)",
    dash: "10 6",
    width: 1,
  },
  vantage: {
    color: "var(--chart-3)",
    grey: "var(--chart-3-grey)",
    dash: "1 6",
    width: 1,
  },
  arcadia: {
    color: "var(--chart-4)",
    grey: "var(--chart-4-grey)",
    dash: "12 5 2 5",
    width: 1,
  },
};

/**
 * One series of the chart: the brand it draws, and how it is drawn.
 *
 * The drawing is the treatment with the colour the current mode wears: every
 * other property of the treatment is carried over, so a treatment that grows
 * a property cannot be half-copied here.
 */
export interface DrawnSeries extends Omit<Treatment, "color" | "grey"> {
  brand: Brand;
  /** The colour the series wears in the mode the reader chose. */
  color: ChartToken;
}
