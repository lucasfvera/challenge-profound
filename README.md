# AI Visibility Snapshot

A deterministic, dark-only dashboard for the fictional brand **Northstar**: how often, and how prominently, the brand shows up in AI-generated answers.

> **All data is simulated.** Every figure in this app comes from a fixed, fictional snapshot. Nothing here is collected live from ChatGPT, Claude, Gemini, Perplexity, or any other platform.

**What this is:** a portfolio demo for Profound — a working slice of an AI-visibility dashboard, built to be read, run and reviewed end to end. It ships the whole story: the Snapshot the numbers come from, the metrics derived from it, the surfaces that show them, the evidence behind each number, and the suites that keep them honest. There is no account, nothing is saved, and no platform is ever contacted.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI preset, `components.json`) · Recharts 3 · Playwright · Docker.

## Data

The app reads one module: `src/lib/snapshot`. It holds the Snapshot fixture —
15 tracked Prompts across 4 Platforms, Northstar plus 3 Competitors, the
Answers those Prompts collected (with their Mentions and Citations), and 30
daily visibility points per brand and Platform — plus the pure derivations on
top of it: Visibility Score, Share of Voice, Average Position, per-platform
aggregation, answer segmentation, the window-level average and trend, the
first-mention position, the chart's series and tracked-day rows, and the
prompt table's rows — every tracked Prompt with the brand's Mention state on
each Platform, ordered by the Platform the view is scoped to. The chart reads
the tracked window through the same layer, and the last tracked day of a
series is the score its Answers produce, so the chart's history ends where
the cards' number begins.

Nothing is fetched and nothing is generated at runtime: the fixture is a set of
literals, and the derivations are pure functions of it. A metric the data
cannot answer is `null` — never `NaN` — and the dashboard renders it as an em
dash. The last daily point of every series is the score that brand's Answers
on that Platform produce, so the history and the evidence agree.

The tracked Platforms live in their own module
(`src/lib/snapshot/platforms.ts`) so the prompt detail route's client
boundary can read them without pulling the whole fixture into the browser.

The prompt table reads the Snapshot through its own contract
(`src/lib/prompt-table.ts`): it derives every tracked Prompt's Mention state
on every Platform from the same segmentation the KPI cards count, and orders
the rows by the Platform the view is scoped to. The rows' own rules live
beside it in `src/lib/prompt-row.ts`: the URL a row opens, and the keys that
activate it.

## Design system

The visual language lives in the semantic tokens of `src/app/globals.css` and is
documented in [`docs/design-system.md`](docs/design-system.md) — the source of
truth for the token set, the type scale, component states, and the responsive
conventions. Components consume tokens through Tailwind utilities (`bg-card`,
`text-muted-foreground`, `border-border`, `bg-primary`), never through raw
colors.

The base components live in `src/components/ui/`: card, badge, button, table
primitives, skeleton, the segmented control, and the popover. The platform
scope control lives in `src/components/`, because the overview and the prompt
detail route share it; the KPI cards and the visibility chart live in
`src/components/overview/`, and the overview's prompt table and the prompt
detail route's panels in `src/components/prompts/`. They compose the base
components rather than adding to the inventory.

## Requirements

Node.js >= 20.9.

The end-to-end smoke suite needs Chromium, which Playwright installs once per
machine — `npx playwright install chromium`, or
`npx playwright install --with-deps chromium` on Linux, where the browser
also needs the system libraries it links against.

The container needs Docker, and the image is built from this tree.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Run in a container

```bash
npm run docker:build
npm run docker:run
```

`npm run docker:build` builds the image; `npm run docker:run` serves it on
<http://127.0.0.1:3000> and removes the container when it stops. Stop the dev
server first: the container takes the same port. The image is multi-stage: it
installs from the lockfile, builds the app, and carries the production server
alone in the last stage — the traced server, the static assets and the
production dependencies, with no toolchain and no test runner in it. It runs
as a non-root user, the `node` user the base image ships, and it needs no
secret and no configuration from whoever runs it: the image supplies its own
port and host, and the demo fetches nothing at serve time.

## Deployment

The app is a plain Next.js app, so Vercel deploys it with no configuration:
the build Vercel runs is the plain build this repo has always produced. The
standalone output — the traced server the container carries — is asked for by
the container's build only (`BUILD_OUTPUT=standalone` in the `Dockerfile`),
and a Vercel build never gets it, so no hosting platform is handed a build it
did not ask for. The guard is deliberate: on Next 16.3 the standalone output
broke every Vercel deployment of a standalone-configured app, and the fix
landed upstream, but a build that no platform asked for is a build that no
platform should be given.

## Verification

```bash
npm run verify
```

That is the whole pass: the lint rules, the types, the unit and component
suite, the production build, and the Playwright smoke suite, in that order,
in one run, stopping at the first failure. The cheap checks come first. The
build is the pass's own gate on the production bundle: when it fails, the
pass says the bundle does not compile, instead of the browser suite reporting
a server that never came up. Each of the five is a command of its own, and
each answers a different question:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

`npm run lint` asks whether the code follows the repo's rules; `npm run
typecheck` asks whether the types hold; `npm run test` asks whether the
derivation layer and the surfaces behave; `npm run build` asks whether the
production bundle builds; `npm run test:e2e` asks whether the demo story
works in a browser against a production build — the harness builds that
bundle itself, so the suite pays for a second build.

The container is outside the chain, because it needs a Docker daemon and it
is slow. It is checked beside the pass: `npm run docker:build` asks whether
the image builds, and `npm run docker:run` proves it, with the app answering
on <http://127.0.0.1:3000>. See [Run in a container](#run-in-a-container).

`npm run test` runs the Vitest suite over the derivation layer, the fixture,
the platform scope contract, the prompt detail contract, the prompt table
contract, the prompt row contract, the six component tests, and the app's
date formatting. The component tests are the second seam, next to the pure
one: they render the surfaces in a DOM and assert the interaction and
accessibility contracts — the segmented control's keyboard and ARIA, the KPI
card's delta formatting and its metric explanation, the answer panel's Mention
highlights, the prompt row's activation, the chart's tooltip and legend, and
the citations panel's links. `npm run build` produces a production bundle;
run it with `npm run start` to serve that bundle locally.

`npm run test:e2e` runs the Playwright smoke suite against a **production
build**: the harness runs `next build && next start` on a port of its own and
the suite talks to that bundle, so a green run is a statement about what
ships.

The smoke suite is the third seam: eight end-to-end tests that prove the demo
story — the metric cards and the chart render, the platform switch rewrites
the URL and moves the table's scope, the clickable filters say they are
clickable, the movements say which way they went, a prompt row opens the
detail with the highlighted mentions and the citations, an unknown prompt id
answers 404, the overview holds at 390px, and an unknown platform param falls
back to the default with the table still rendered. It reads the app the way a
reader does — by role and accessible name, and by the text a reader sees
where the surface carries no name — with one kind of surface reached through
a hook of its own: the cards, which the card primitive gives no role and no
name, so the suite takes them through the primitive's `data-slot` attribute.

## What the app renders today

The dark app shell — a header with the product name and a "Simulated data"
badge — and, on the home route, the overview: the platform scope control, the
three KPI cards, the visibility chart, and the prompt table. The scope
control filters the overview by Platform and writes the choice to the
`platform` search param, so a view of the dashboard is shareable; a value the
Snapshot does not track falls back to ChatGPT. The KPI cards report
Northstar's Visibility Score, Share of Voice, and Average Position for the
selected Platform, and each metric's name carries an information icon: hover
it, click it or tap it, and the metric's explanation opens in a popover, so
a reader who does not know what the metric measures can ask. The Visibility
Score and the Share of Voice carry the movement of the tracked window, marked
with an arrow and coloured by the way it went — green for up, red for down —
so the direction is readable at a glance; the Average Position has none to
compare, because the Snapshot tracks no daily mention positions.

Below them, the visibility chart draws the Visibility Score of Northstar and
its three competitors over the tracked 30 days, for the selected Platform.
Northstar's line is the brand accent; the competitors take the neutral ramp
and a line pattern of their own, so the series are told apart by lightness
and by treatment rather than by hue. The legend is a set of toggles that
carry their state in `aria-pressed`, and the tooltip names the tracked day
and the exact score of every visible series on it. A Platform with no tracked
window draws the em dash instead of an empty plot.

The prompt table is the read-only exploration view under the metrics: every
tracked Prompt with its category and a Mention indicator per Platform, the
position Northstar was named at beside each Mention. It is scoped by the same
Platform as the KPI cards, and its rows are ordered by Northstar's strength on
that Platform, so the table and the cards above it always read the same scope.
Below the `sm` breakpoint the table gives way to cards. Every row is a link
into the prompt detail route: a click anywhere on the row opens the Prompt's
detail, Enter and Space open it from the keyboard, and the link carries the
Platform the table is scoped to, so the detail route answers with the same
Platform.

The prompt detail route — `/prompts/<prompt-id>`, for example
`/prompts/p-01` — is the evidence view. It renders on the server from the
Snapshot: the tracked question as the heading, the Answer the selected
Platform gave for it, and the sources behind that Answer. Northstar's Mentions
are picked out in the brand accent and the Competitors' Mentions in a dotted
underline, each with a label a screen reader reads. The same `platform` search
param scopes the route, so a shared link carries both halves of the view, and
a prompt id the Snapshot does not track — or a platform with no answer for it
— is a 404. Switching the platform is a navigation, so a loading skeleton
holds the content while the server answers. The route opens with a way back to
the overview, scoped to the same Platform, so the flow can be walked in both
directions — on a phone, where there is no browser chrome. The prompt list is
the overview's prompt table.

## Adding shadcn/ui components

```bash
npx shadcn add <component>
```

The CLI reads `components.json`; components land in `src/components/ui/`. It
writes its own defaults, which the design system overrides: strip the
`focus-visible:ring-*` and `outline-none` utilities (focus is drawn once, by
the global outline in `src/app/globals.css`), replace `bg-accent` chrome
with `bg-secondary` or `bg-muted` (`--accent` is the brand color), and
restyle an overlay: the popover's `ring-foreground/10` becomes the
`--border` hairline, its fixed `w-72` panel becomes a popup that fits its
copy, and its slide-and-zoom becomes a fade. See
[`docs/design-system.md`](docs/design-system.md).
