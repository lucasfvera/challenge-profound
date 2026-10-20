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

/** The text of the first tracked Prompt, `p-01`. */
const FIRST_PROMPT_TEXT = "best AI visibility analytics tools";

/** The brand the Snapshot measures. */
const NORTHSTAR = "Northstar";

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
  await expect(legend.getByRole("button", { name: NORTHSTAR })).toBeVisible();
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

test("The platform switch rewrites the URL and moves the table's scope", async ({
  page,
}) => {
  await page.goto("/");

  const table = page.getByRole("table");
  await expect(
    table.getByRole("columnheader", { name: "ChatGPT (selected platform)" }),
  ).toBeVisible();

  await page
    .getByRole("group", { name: "Platform" })
    .getByRole("button", { name: "Claude" })
    .click();

  // The scope lives in the URL, so the view is shareable: the switch has
  // to rewrite it.
  await expect(page).toHaveURL("/?platform=claude");

  // The table reads the same scope as the metrics above it, so its
  // selected column moves with the switch.
  await expect(
    table.getByRole("columnheader", { name: "Claude (selected platform)" }),
  ).toBeVisible();

  // The rows carry the scope as well: the row opens the detail with the
  // platform the table is scoped to.
  await expect(
    table.getByRole("link", { name: FIRST_PROMPT_TEXT }),
  ).toHaveAttribute("href", "/prompts/p-01?platform=claude");
});

test("A prompt row opens the detail with the highlighted mentions and the citations", async ({
  page,
}) => {
  await page.goto("/");

  // The scope moves first, so the drill-down carries a platform of its own
  // and not the default the reader never picked.
  await page
    .getByRole("group", { name: "Platform" })
    .getByRole("button", { name: "Claude" })
    .click();
  await expect(page).toHaveURL("/?platform=claude");

  await page
    .getByRole("table")
    .getByRole("link", { name: FIRST_PROMPT_TEXT })
    .click();

  await expect(page).toHaveURL("/prompts/p-01?platform=claude");
  await expect(
    page.getByRole("heading", { name: FIRST_PROMPT_TEXT }),
  ).toBeVisible();

  // The Mention of the brand being measured wears the brand accent. The
  // app marks it with the label a screen reader reads, so the highlight is
  // never colour alone — and that label is what the suite reads.
  const mention = page.getByText(NORTHSTAR);
  await expect(mention).toBeVisible();
  await expect(mention).toContainText("(the brand being measured)");

  // The sources behind the answer: the body carries a marker for each
  // citation, and the marker points at the entry the panel lists.
  const marker = page.getByRole("link", {
    name: "[1] A Buyer's Guide to AI Visibility Platforms",
  });
  const source = page.getByRole("link", {
    name: "A Buyer's Guide to AI Visibility Platforms (opens in a new tab)",
  });

  await expect(marker).toBeVisible();
  await expect(source).toBeVisible();

  // The marker's fragment is the id of the entry it points at.
  const href = (await marker.getAttribute("href")) ?? "";
  await expect(source.locator("xpath=..")).toHaveAttribute(
    "id",
    href.replace(/^#/, ""),
  );
});

test("An unknown prompt id answers 404", async ({ page }) => {
  const response = await page.goto("/prompts/p-99");

  // The status is the contract: a Prompt the Snapshot does not track is
  // not a page.
  expect(response?.status()).toBe(404);

  // And the page that answers is the route's own.
  await expect(
    page.getByRole("heading", {
      name: "The Snapshot has no answer for this prompt",
    }),
  ).toBeVisible();
});

test("An unknown platform param falls back to the default platform", async ({
  page,
}) => {
  await page.goto("/?platform=not-a-platform");

  // A hand-edited link has to render a view, and it must never select a
  // platform the Snapshot does not track: the scope falls back to the
  // Snapshot's first platform, and the table is scoped to it.
  await expect(
    page
      .getByRole("table")
      .getByRole("columnheader", { name: "ChatGPT (selected platform)" }),
  ).toBeVisible();

  // The scope control agrees with the scope the table reads.
  await expect(
    page
      .getByRole("group", { name: "Platform" })
      .getByRole("button", { name: "ChatGPT" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("The overview holds at a phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  // Below the `sm` breakpoint the table gives way to cards, so the same
  // rows are still reachable on a phone.
  await expect(page.getByRole("table", { includeHidden: true })).toBeHidden();
  await expect(page.getByRole("link", { name: FIRST_PROMPT_TEXT })).toBeVisible();

  // The flow has to work from ~390px to desktop without scrolling
  // sideways. The measure is the content's width against the layout
  // viewport, so a vertical scrollbar is not counted as an overflow.
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(0);
});
