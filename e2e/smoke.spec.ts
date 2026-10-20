import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * The smoke suite: the demo story, proven against the production bundle.
 *
 * The suite is a smoke suite, not a second component suite. It proves that
 * the built app still tells the story: the metrics and the chart render,
 * the scope moves the view and rewrites the URL, a row opens the evidence
 * behind it, and the edges the app promises to hold still hold.
 *
 * The suite reads what a reader can reach: a role and an accessible name
 * wherever the surface carries one — the scope control is a group named
 * "Platform", the chart's legend is a group named "Series", the prompt
 * table is a table with a caption, and a row's link is named after the
 * Prompt it opens.
 *
 * Two targets have no such handle, and both are named in the open: a metric
 * card, which the card primitive gives no role and no name, so the suite
 * takes it through the primitive's own `data-slot` hook; and the chart's
 * plot, a drawing with no text, which carries a test id of its own. A CSS
 * class is never asserted.
 */

/** The Visibility Score, as the KPI row names its card. */
const VISIBILITY_SCORE = /^Visibility Score/;

/** The Share of Voice, as the KPI row names its card. */
const SHARE_OF_VOICE = /^Share of Voice/;

/** The Average Position, as the KPI row names its card. */
const AVERAGE_POSITION = /^Average Position/;

/** The first tracked day of the Snapshot's window, as the axis labels it. */
const FIRST_TRACKED_DAY = "Sep 1";

/**
 * The metric card of one KPI.
 *
 * The card is addressed by the name it starts with. The chart card repeats
 * the name of the Visibility Score card, and a Prompt's own text can repeat
 * a metric's name — "AI share of voice tools for enterprise teams" — so a
 * loose match would find the wrong card. The chart is told apart by its
 * legend, which no metric card carries.
 */
function kpiCard(page: Page, metric: RegExp) {
  return page.locator("[data-slot='card']").filter({
    hasText: metric,
    hasNot: page.getByRole("group", { name: "Series" }),
  });
}

test("The overview renders the metric cards and the chart", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

  await expect(kpiCard(page, VISIBILITY_SCORE)).toBeVisible();
  await expect(kpiCard(page, SHARE_OF_VOICE)).toBeVisible();
  await expect(kpiCard(page, AVERAGE_POSITION)).toBeVisible();

  const legend = page.getByRole("group", { name: "Series" });
  await expect(legend).toBeVisible();
  await expect(legend.getByRole("button", { name: "Northstar" })).toBeVisible();
  await expect(legend.getByRole("button", { name: "Lumen" })).toBeVisible();
  await expect(page.getByText("Last 30 days on ChatGPT")).toBeVisible();

  // The plot is a drawing: it has no role and no text, so it is the one
  // target the suite reads through the test id the chart already carries.
  // Its axis labels the tracked days, and a label is there only once the
  // data reached the screen.
  const plot = page.getByTestId("visibility-chart-plot");
  await expect(plot).toBeVisible();
  await expect(plot.getByText(FIRST_TRACKED_DAY, { exact: true })).toBeVisible();
});
