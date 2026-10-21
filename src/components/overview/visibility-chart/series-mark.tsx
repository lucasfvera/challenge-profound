import type { DrawnSeries } from "@/components/overview/visibility-chart/treatment";

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
 * draws — only shorter, and in the colour the current mode wears. A reference
 * too short to carry the dash cannot tell two series apart.
 */
export function SeriesMark({ series }: { series: DrawnSeries }) {
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
        stroke={series.color}
        strokeWidth={series.width}
        strokeDasharray={series.dash}
        strokeLinecap="round"
      />
    </svg>
  );
}
