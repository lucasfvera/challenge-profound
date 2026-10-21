/**
 * The app's value formatting.
 *
 * A metric the app reports is written the same way wherever it appears, so
 * the chart's tooltip and the KPI card cannot disagree about a number. An axis
 * tick is not a metric: it is a whole number, and it says so.
 */

/** The unit a metric is reported in. */
export type MetricUnit = "percent" | "position";

/**
 * A metric, in the unit it is reported in: `66.7%` or `1.5`.
 */
export function formatMetric(value: number, unit: MetricUnit): string {
  return unit === "percent" ? `${value.toFixed(1)}%` : value.toFixed(1);
}

/**
 * A percentage on an axis, where the tick is a whole number: `25%`.
 */
export function formatPercentTick(value: number): string {
  return `${value}%`;
}

/**
 * A metric the Snapshot may not be able to answer, in the unit it is
 * reported in: `66.7%`, or the em dash when there is no answer.
 *
 * The em dash is the design system's mark for a metric the data cannot
 * report, and it is the one the whole app wears — so the rule lives here,
 * next to the formatting it belongs to, and every surface that shows a
 * metric reads the same mark.
 */
export function formatMetricValue(
  value: number | null,
  unit: MetricUnit,
): string {
  return value === null ? "—" : formatMetric(value, unit);
}
