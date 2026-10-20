import type { Snapshot } from "@/lib/snapshot";

/**
 * The app's date formatting.
 *
 * Every date the app shows is read from its ISO parts, never through `Date`.
 * A tracked day is a calendar day, and parsing it into a timestamp would move
 * it to the day before or the day after, depending on the reader's time zone.
 */

/** The month names the app writes its dates with. */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * A tracked day as the chart's axis writes it: `Sep 1`.
 */
export function formatDay(isoDate: string): string {
  const [, month, day] = isoDate.split("-");

  return `${MONTHS[Number(month) - 1]} ${Number(day)}`;
}

/**
 * A tracked day as the chart's tooltip heads it: `Sep 1, 2026`.
 */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");

  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
}

/**
 * The tracked window as the chart describes it: `Sep 1 – Sep 30, 2026`.
 */
export function formatPeriod(period: Snapshot["period"]): string {
  const [, startMonth, startDay] = period.start.split("-");
  const [endYear, endMonth, endDay] = period.end.split("-");

  return `${MONTHS[Number(startMonth) - 1]} ${Number(startDay)} – ${MONTHS[Number(endMonth) - 1]} ${Number(endDay)}, ${endYear}`;
}
