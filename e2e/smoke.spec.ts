import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

/**
 * The smoke suite: the demo story, proven against the production bundle.
 *
 * The suite is a smoke suite, not a second component suite. It proves that
 * the built app still tells the story: the metrics and the chart render,
 * the scope moves the view and rewrites the URL, a row opens the evidence
 * behind it, the clickable filters say they are clickable, the movements
 * say which way they went, and the edges the app promises to hold still
 * hold.
 *
 * The suite reads what a reader can reach: a role and an accessible name
 * wherever the surface carries one — the scope control is a group named
 * "Platform", the chart's legend is a group named "Series", the chart's plot
 * is an image named after the metric it draws, the prompt table is a table
 * with a caption, and a row's link is named after the Prompt it opens. A
 * surface that carries no name is read through the text a reader sees.
 *
 * The cursor, the movement's colour and the series' colours are read here and
 * not in the component suite: the bundle carries the stylesheet that turns
 * the pointer utility into a cursor and that resolves a movement's and a
 * series' token into a colour, and a unit test would have to assert the class
 * or the token instead of the affordance.
 *
 * Four kinds of surface are read another way, and all four are named in the
 * open: the cards — the metric cards and the chart's card — which the card
 * primitive gives no role and no name, so the suite takes them through the
 * primitive's own `data-slot` hook; the badge, which is a span with no name
 * of its own, so the suite reads the text it shows; the chart's series
 * references, which are decorative drawings inside named toggles, so the
 * suite takes them through the markup they are drawn in; and the chart's
 * plotted lines, which are drawings with no name at all, so the suite takes
 * them through the charting library's own mark for a series line. A CSS
 * class is never asserted: a class is a way in, and the library's own is the
 * only one the chart's markup offers.
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

/** The toggle that takes the hue off the competitors, as it names itself. */
const GREYSCALE_MODE = "Greyscale";

/** The Claude platform, as the scope control names it. */
const CLAUDE = "Claude";

/** The badge the header carries, as the app labels it. */
const SIMULATED_DATA = "Simulated data";

/** The title of the source the answer for the first Prompt cites. */
const BUYERS_GUIDE = "A Buyer's Guide to AI Visibility Platforms";

/** The hook the card primitive leaves for the suite to take a card by. */
const CARD_SLOT = "[data-slot='card']";

/**
 * The saturation a series colour has to reach to be a hue.
 *
 * The neutral greys the ramp used to hold sat under 0.1, and the hues it
 * holds now sit above 0.4; 0.2 is the line between a colour that names a
 * series and one that cannot.
 */
const SERIES_HUE_FLOOR = 0.2;

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
 * The segment of the platform scope that names one Platform.
 *
 * The scope control is a group named `Platform` and a segment is a button
 * inside it, so the suite reaches a Platform the way a reader does: by the
 * name the group and the segment carry.
 */
function platformSegment(page: Page, platform: string) {
  return page
    .getByRole("group", { name: PLATFORM_GROUP })
    .getByRole("button", { name: platform });
}

/**
 * The colour a token resolves to.
 *
 * A movement wears the token of the direction it names, so the suite reads
 * the token and reads the movement against it, rather than pinning a colour
 * the design system may move. A token that is not defined is a failure,
 * not a colour to compare against: without it the movement and the token
 * would both fall back to the inherited foreground and pass.
 */
async function tokenColor(page: Page, token: string) {
  return page.evaluate((name) => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();

    if (!value) {
      throw new Error(`the ${name} token is not defined`);
    }

    const probe = document.createElement("span");
    probe.style.color = value;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
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
  return page.locator(CARD_SLOT).filter({
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
  return page.locator(CARD_SLOT).filter({ has: legend });
}

/**
 * The chart's series references: the sample each legend toggle wears.
 *
 * The reference is a decorative drawing with no name of its own — the toggle
 * carries the series' name — so the suite takes it through the markup it is
 * drawn in.
 */
function seriesReferences(page: Page) {
  return page.getByRole("group", { name: SERIES_GROUP }).locator("svg line");
}

/**
 * The chart's plotted series: the lines the plot draws.
 *
 * The lines are drawings with no name of their own, so the suite takes them
 * through the markup they are drawn in — the same way it reads the reference
 * each legend toggle wears. The class is the charting library's own mark for
 * a series line: an implementation detail of the library, not a contract the
 * app holds.
 */
function plottedLines(page: Page) {
  return page
    .getByRole("img", { name: /Visibility Score of/ })
    .locator("path.recharts-line-curve");
}

/**
 * The colours a set of series is drawn with.
 *
 * The colour is read from the computed style, because the bundle carries the
 * stylesheet that resolves the series' token into a colour — a unit test
 * would have to assert the token instead, and the tokens were distinct
 * before the colours were.
 */
async function seriesColours(lines: Locator) {
  return lines.evaluateAll((marks) =>
    marks.map((mark) => getComputedStyle(mark).stroke),
  );
}

/**
 * The saturation of a colour, from 0 (a grey) to 1 (the most saturated
 * colour there is).
 *
 * A resolved colour reads as `rgb(r, g, b)`, so the channels are the numbers
 * in it.
 */
function saturation(colour: string) {
  const channels = colour.match(/^rgb\((\d+), (\d+), (\d+)\)$/);

  if (!channels) {
    throw new Error(`the series colour ${colour} is not a colour`);
  }

  const [red, green, blue] = channels.slice(1).map(Number);
  const lightest = Math.max(red, green, blue);
  const darkest = Math.min(red, green, blue);

  return (lightest - darkest) / lightest;
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

  // The plot is a drawing, and the chart names it: it is an image whose
  // name says the metric, the brands and the Platform it draws, so a screen
  // reader does not read the axis ticks as the chart's name.
  const plot = page.getByRole("img", { name: /Visibility Score of/ });

  await expect(plot).toBeVisible();

  // Its axis labels the tracked days, and a label is there only once the
  // data reached the screen. The axis thins the labels so they do not
  // overlap, so the suite reads the labels the axis drew rather than a day
  // it expects.
  await expect(plot.getByText(/^Sep \d+$/).first()).toBeVisible();
});

test("The chart tells its series apart by colour", async ({ page }) => {
  await page.goto("/");

  // Every brand wears a colour of its own, so a reader tells the lines
  // apart by their colour.
  const colours = await seriesColours(seriesReferences(page));

  expect(colours).toHaveLength(4);

  // No two series wear the same colour...
  expect(new Set(colours).size).toBe(colours.length);

  // ... and every one of them is a hue: a grey cannot tell one series from
  // another, which is why the neutral ramp the chart used to wear could not
  // name a line.
  for (const colour of colours) {
    expect(saturation(colour)).toBeGreaterThanOrEqual(SERIES_HUE_FLOOR);
  }
});

test("The chart draws each series' reference at the scale of the line it names", async ({
  page,
}) => {
  await page.goto("/");

  // The reference is what names the line, so it is drawn at the scale the
  // plot draws it at: the sample is as long as the space it declares, or
  // the dash it shows is not the dash the line wears.
  const samples = await seriesReferences(page).evaluateAll((marks) =>
    marks.map((mark) => ({
      drawn: mark.getBoundingClientRect().width,
      declared: Number(
        mark.parentElement?.getAttribute("viewBox")?.split(" ")[2],
      ),
    })),
  );

  expect(samples).toHaveLength(4);

  for (const sample of samples) {
    expect(sample.drawn).toBe(sample.declared);
  }
});

test("The chart can take the hue off the competitors", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("switch", { name: GREYSCALE_MODE });
  await expect(toggle).toHaveAttribute("aria-checked", "false");

  await toggle.click();

  await expect(toggle).toHaveAttribute("aria-checked", "true");

  // The plot is what the mode is about, so the colours are read from the
  // lines the plot draws.
  const colours = await seriesColours(plottedLines(page));

  expect(colours).toHaveLength(4);

  // The references come in the legend's order, and the legend puts the brand
  // the reader is measuring first. The brand keeps its hue: it is the one
  // line the reader is looking for...
  expect(saturation(colours[0])).toBeGreaterThanOrEqual(SERIES_HUE_FLOOR);

  // ... and the rivals lose theirs, so the plot carries a single hue.
  for (const colour of colours.slice(1)) {
    expect(saturation(colour)).toBeLessThan(SERIES_HUE_FLOOR);
  }

  // The rivals are still told apart: the greyscale ramp is a ramp of its
  // own, so no two of them wear the same grey.
  expect(new Set(colours.slice(1)).size).toBe(colours.length - 1);

  // And the reference in the legend is a sample of the line it names, so it
  // wears the same colour the plot draws.
  expect(await seriesColours(seriesReferences(page))).toEqual(colours);

  // The mode is a view choice: it survives a change of Platform, the way the
  // legend's hidden series do.
  await platformSegment(page, CLAUDE).click();

  await expect(page).toHaveURL("/?platform=claude");
  await expect(toggle).toHaveAttribute("aria-checked", "true");
});

test("The platform switch rewrites the URL and moves the table's scope", async ({
  page,
}) => {
  await page.goto("/");

  const table = page.getByRole("table");
  await expect(
    table.getByRole("columnheader", { name: selectedPlatform("ChatGPT") }),
  ).toBeVisible();

  await platformSegment(page, CLAUDE).click();

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
  await expect(platformSegment(page, CLAUDE)).toHaveCSS("cursor", "pointer");

  await expect(
    page
      .getByRole("group", { name: SERIES_GROUP })
      .getByRole("button", { name: NORTHSTAR }),
  ).toHaveCSS("cursor", "pointer");

  // The badge is not clickable, so it keeps the default cursor: a pointer on
  // an inert badge would be a lie.
  await expect(page.getByText(SIMULATED_DATA)).toHaveCSS("cursor", "auto");
});

test("The movements say which way they went", async ({ page }) => {
  await page.goto("/");

  // The movement wears the colour of the direction it names: up is the
  // positive green, down is the destructive red. The words and the mark
  // say it too, and the component suite proves both; the colour is only
  // observable where the stylesheet is. Every movement the Snapshot
  // reports is up today, so the down branch is the one this case cannot
  // reach.
  const movement = kpiCard(page, VISIBILITY_SCORE).getByText(
    /^(Up|Down) [\d.]+ pts$/,
  );

  const token = await movement.evaluate((element) =>
    element.textContent?.startsWith("Down") ? "--destructive" : "--positive",
  );

  await expect(movement).toHaveCSS("color", await tokenColor(page, token));
});

test("A prompt row opens the detail with the highlighted mentions and the citations", async ({
  page,
}) => {
  await page.goto("/");

  // The scope moves first, so the drill-down carries a platform of its own
  // and not the default the reader never picked.
  await platformSegment(page, CLAUDE).click();
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
  await expect(platformSegment(page, "ChatGPT")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("The overview holds at a phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  // Below the `sm` breakpoint the table gives way to cards, so the same
  // rows are still reachable on a phone.
  const table = page.getByRole("table", { includeHidden: true });
  await expect(table).toHaveCount(1);
  await expect(table).toBeHidden();
  await expect(
    page.getByRole("link", { name: FIRST_PROMPT_TEXT }),
  ).toBeVisible();

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
