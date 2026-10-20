import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

/**
 * The smoke suite: the demo story, proven against the production bundle.
 *
 * The suite is a smoke suite, not a second component suite. It proves that
 * the built app still tells the story: the metrics and the chart render,
 * the scope moves the view and rewrites the URL, a row opens the evidence
 * behind it, the clickable filters say they are clickable, and the edges the
 * app promises to hold still hold.
 *
 * The suite reads what a reader can reach: a role and an accessible name
 * wherever the surface carries one — the scope control is a group named
 * "Platform", the chart's legend is a group named "Series", the chart's plot
 * is an image named after the metric it draws, the prompt table is a table
 * with a caption, and a row's link is named after the Prompt it opens. A
 * surface that carries no name is read through the text a reader sees.
 *
 * The cursor is read here and not in the component suite: the bundle carries
 * the stylesheet that turns the pointer utility into a cursor, and a unit
 * test would have to assert the class instead of the affordance.
 *
 * Two kinds of surface are read another way, and both are named in the open:
 * the cards — the metric cards and the chart's card — which the card
 * primitive gives no role and no name, so the suite takes them through the
 * primitive's own `data-slot` hook; and the badge, which is a span with no
 * name of its own, so the suite reads the text it shows. A CSS class is
 * never asserted.
 */

/** The Visibility Score, as the KPI row names its card. */
const VISIBILITY_SCORE = /^Visibility Score/;

/** The Share of Voice, as the KPI row names its card. */
const SHARE_OF_VOICE = /^Share of Voice/;

/** The Average Position, as the KPI row names its card. */
const AVERAGE_POSITION = /^Average Position/;

/** The text of the first tracked Prompt, `p-01`. */
const FIRST_PROMPT_TEXT = "best AI visibility analytics tools";

/** The brand the Snapshot measures. */
const NORTHSTAR = "Northstar";

/** The scope control, as the app names its group. */
const PLATFORM_GROUP = "Platform";

/** The chart's legend, as the app names its group. */
const SERIES_GROUP = "Series";

/** The Claude platform, as the scope control names it. */
const CLAUDE = "Claude";

/** The badge the header carries, as the app labels it. */
const SIMULATED_DATA = "Simulated data";

/** The title of the source the answer for the first Prompt cites. */
const BUYERS_GUIDE = "A Buyer's Guide to AI Visibility Platforms";

/**
 * The name of a column header for the platform the table is scoped to.
 *
 * The table marks the scoped platform in the header's accessible name, so
 * that name is how the suite reads the table's scope.
 */
function selectedPlatform(platform: string) {
  return `${platform} (selected platform)`;
}

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
    hasNot: page.getByRole("group", { name: SERIES_GROUP }),
  });
}

/**
 * The chart's card: the card that holds the legend.
 *
 * The card primitive gives no role and no name, so the card is taken
 * through its own `data-slot` hook and told apart by the legend it holds,
 * which no metric card carries.
 */
function chartCard(page: Page, legend: Locator) {
  return page.locator("[data-slot='card']").filter({ has: legend });
}

test("The overview renders the metric cards and the chart", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

  await expect(kpiCard(page, VISIBILITY_SCORE)).toBeVisible();
  await expect(kpiCard(page, SHARE_OF_VOICE)).toBeVisible();
  await expect(kpiCard(page, AVERAGE_POSITION)).toBeVisible();

  const legend = page.getByRole("group", { name: SERIES_GROUP });
  await expect(legend).toBeVisible();
  await expect(legend.getByRole("button", { name: NORTHSTAR })).toBeVisible();
  await expect(legend.getByRole("button", { name: "Lumen" })).toBeVisible();

  // The chart's card names the Platform it is scoped to and the window it
  // covers, in the description it carries.
  await expect(
    chartCard(page, legend).getByText("ChatGPT · Sep 1 – Sep 30, 2026"),
  ).toBeVisible();

  // The plot is a drawing, and the accessibility layer names it: the chart
  // is an image whose name says the metric, the brands and the Platform it
  // draws, so a screen reader does not read the axis ticks as the chart's
  // name.
  const plot = page.getByRole("img", { name: /Visibility Score of/ });

  await expect(plot).toBeVisible();

  // Its axis labels the tracked days, and a label is there only once the
  // data reached the screen. The axis thins the labels so they do not
  // overlap, so the suite reads the labels the axis drew rather than a day
  // it expects.
  await expect(plot.getByText(/^Sep \d+$/).first()).toBeVisible();
});

test("The platform switch rewrites the URL and moves the table's scope", async ({
  page,
}) => {
  await page.goto("/");

  const table = page.getByRole("table");
  await expect(
    table.getByRole("columnheader", { name: selectedPlatform("ChatGPT") }),
  ).toBeVisible();

  await page
    .getByRole("group", { name: PLATFORM_GROUP })
    .getByRole("button", { name: CLAUDE })
    .click();

  // The scope lives in the URL, so the view is shareable: the switch has
  // to rewrite it.
  await expect(page).toHaveURL("/?platform=claude");

  // The table reads the same scope as the metrics above it, so its
  // selected column moves with the switch.
  await expect(
    table.getByRole("columnheader", { name: selectedPlatform(CLAUDE) }),
  ).toBeVisible();

  // The rows carry the scope as well: the row opens the detail with the
  // platform the table is scoped to.
  await expect(
    table.getByRole("link", { name: FIRST_PROMPT_TEXT }),
  ).toHaveAttribute("href", "/prompts/p-01?platform=claude");
});

test("The clickable filters say they are clickable", async ({ page }) => {
  await page.goto("/");

  // The platform scope and the chart's legend are the two filters of the
  // overview, and both answer a click. The cursor is the affordance that
  // says so, so the reader is not left to find out by clicking.
  await expect(
    page
      .getByRole("group", { name: PLATFORM_GROUP })
      .getByRole("button", { name: CLAUDE }),
  ).toHaveCSS("cursor", "pointer");

  await expect(
    page
      .getByRole("group", { name: SERIES_GROUP })
      .getByRole("button", { name: NORTHSTAR }),
  ).toHaveCSS("cursor", "pointer");

  // The badge is not clickable, so it keeps the default cursor: a pointer on
  // an inert badge would be a lie.
  await expect(page.getByText(SIMULATED_DATA)).toHaveCSS("cursor", "auto");
});

test("A prompt row opens the detail with the highlighted mentions and the citations", async ({
  page,
}) => {
  await page.goto("/");

  // The scope moves first, so the drill-down carries a platform of its own
  // and not the default the reader never picked.
  await page
    .getByRole("group", { name: PLATFORM_GROUP })
    .getByRole("button", { name: CLAUDE })
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
    name: `[1] ${BUYERS_GUIDE}`,
  });
  const source = page.getByRole("link", {
    name: `${BUYERS_GUIDE} (opens in a new tab)`,
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
      .getByRole("group", { name: PLATFORM_GROUP })
      .getByRole("button", { name: "ChatGPT" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("The overview holds at a phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  // Below the `sm` breakpoint the table gives way to cards, so the same
  // rows are still reachable on a phone.
  const table = page.getByRole("table", { includeHidden: true });
  await expect(table).toHaveCount(1);
  await expect(table).toBeHidden();
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
