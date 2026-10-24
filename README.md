# AI Visibility Snapshot

A deterministic, dark-only dashboard for the fictional brand **Northstar**: how often, and how prominently, the brand shows up in AI-generated answers.

> **All data is simulated.** Every figure in this app comes from a fixed, fictional snapshot. Nothing here is collected live from ChatGPT, Claude, Gemini, Perplexity, or any other platform.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI preset, `components.json`) · Recharts 3.

## Data

The app reads one module: `src/lib/snapshot`. It holds the Snapshot fixture —
15 tracked Prompts across 4 Platforms, Northstar plus 3 Competitors, the
Answers those Prompts collected (with their Mentions and Citations), and 30
daily visibility points per brand and Platform — plus the pure derivations on
top of it: Visibility Score, Share of Voice, Average Position, per-platform
aggregation, answer segmentation, the window-level average and trend, the
first-mention position, the chart's series and tracked-day rows, and the
prompt table's rows — every tracked Prompt with the brand's Mention state on
each Platform, ordered by the Platform the view is scoped to.

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
the rows by the Platform the view is scoped to.

## Design system

The visual language lives in the semantic tokens of `src/app/globals.css` and is
documented in [`docs/design-system.md`](docs/design-system.md) — the source of
truth for the token set, the type scale, component states, and the responsive
conventions. Components consume tokens through Tailwind utilities (`bg-card`,
`text-muted-foreground`, `border-border`, `bg-primary`), never through raw
colors.

The base components live in `src/components/ui/`: card, badge, button, table
primitives, skeleton, and the segmented control. The platform scope control
lives in `src/components/`, because the overview and the prompt detail route
share it; the KPI cards and the visibility chart live in
`src/components/overview/`, and the overview's prompt table and the prompt
detail route's panels in `src/components/prompts/`. They compose the base
components rather than adding to the inventory.

## Requirements

Node.js >= 20.9.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

`npm run test` runs the Vitest suite over the derivation layer, the fixture,
the platform scope contract, the prompt detail contract, the prompt table
contract, and the app's date formatting. `npm run build` produces a production
bundle; run it with `npm run start` to serve that bundle locally.

## What the app renders today

The dark app shell — a header with the product name and a "Simulated data"
badge — and, on the home route, the overview: the platform scope control, the
three KPI cards, the visibility chart, and the prompt table. The scope
control filters the overview by Platform and writes the choice to the
`platform` search param, so a view of the dashboard is shareable; a value the
Snapshot does not track falls back to ChatGPT. The KPI cards report Northstar's
Visibility Score, Share of Voice, and Average Position for the selected
Platform. The Visibility Score and the Share of Voice carry the movement of the
tracked window; the Average Position has none to compare, because the Snapshot
tracks no daily mention positions.

Below them, the visibility chart draws the Visibility Score of Northstar and
its three competitors over the 30 tracked days of the selected Platform.
Northstar wears the brand accent; the competitors take the neutral chart ramp
and separate by line pattern, so no two series are told apart by hue alone.
The legend toggles a series out of the plot and the tooltip, and the tooltip
names the exact tracked score of every visible series on the hovered day.

The prompt table is the read-only exploration view under the metrics: every
tracked Prompt with its category and a Mention indicator per Platform, the
position Northstar was named at beside each Mention. It is scoped by the same
Platform as the KPI cards, and its rows are ordered by Northstar's strength on
that Platform, so the table and the cards above it always read the same scope.
Below the `sm` breakpoint the table gives way to cards. The rows are not
links yet: navigation into the prompt detail route lands with a later ticket.

The prompt detail route — `/prompts/<prompt-id>`, for example
`/prompts/p-01` — is the evidence view. It renders on the server from the
Snapshot: the tracked question as the heading, the Answer the selected
Platform gave for it, and the sources behind that Answer. Northstar's Mentions
are picked out in the brand accent and the Competitors' Mentions in a dotted
underline, each with a label a screen reader reads. The same `platform` search
param scopes the route, so a shared link carries both halves of the view, and
a prompt id the Snapshot does not track — or a platform with no answer for it
— is a 404. Switching the platform is a navigation, so a loading skeleton
holds the content while the server answers. The prompt list is the overview's
prompt table.

## Adding shadcn/ui components

```bash
npx shadcn add <component>
```

The CLI reads `components.json`; components land in `src/components/ui/`. It
writes its own defaults, which the design system overrides: strip the
`focus-visible:ring-*` and `outline-none` utilities (focus is drawn once, by
the global outline in `src/app/globals.css`) and replace `bg-accent` chrome
with `bg-secondary` or `bg-muted` (`--accent` is the brand color). See
[`docs/design-system.md`](docs/design-system.md).
