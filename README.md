# AI Visibility Snapshot

A deterministic, dark-only dashboard for the fictional brand **Northstar**: how often, and how prominently, the brand shows up in AI-generated answers.

> **All data is simulated.** Every figure in this app comes from a fixed, fictional snapshot. Nothing here is collected live from ChatGPT, Claude, Gemini, Perplexity, or any other platform.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI preset, `components.json`).

## Data

The app reads one module: `src/lib/snapshot`. It holds the Snapshot fixture —
15 tracked Prompts across 4 Platforms, Northstar plus 3 Competitors, the
Answers those Prompts collected (with their Mentions and Citations), and 30
daily visibility points per brand and Platform — plus the pure derivations on
top of it: Visibility Score, Share of Voice, Average Position, per-platform
aggregation, answer segmentation, and the window-level average and trend.

Nothing is fetched and nothing is generated at runtime: the fixture is a set of
literals, and the derivations are pure functions of it. A metric the data
cannot answer is `null` — never `NaN` — and the dashboard renders it as an em
dash. The last daily point of every series is the score that brand's Answers
on that Platform produce, so the history and the evidence agree.

## Design system

The visual language lives in the semantic tokens of `src/app/globals.css` and is
documented in [`docs/design-system.md`](docs/design-system.md) — the source of
truth for the token set, the type scale, component states, and the responsive
conventions. Components consume tokens through Tailwind utilities (`bg-card`,
`text-muted-foreground`, `border-border`, `bg-primary`), never through raw
colors.

The base components live in `src/components/ui/`: card, badge, button, table
primitives, skeleton, and the segmented control. The overview's own surfaces —
the platform scope control and the KPI cards — live in
`src/components/overview/`, and compose the base components rather than
adding to the inventory.

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
and the platform scope contract. `npm run build` produces a production bundle;
run it with `npm run start` to serve that bundle locally.

## What the app renders today

The dark app shell — a header with the product name and a "Simulated data"
badge — and, on the home route, the overview: the platform scope control and
the three KPI cards. The scope control filters the overview by Platform and
writes the choice to the `platform` search param, so a view of the dashboard
is shareable; a value the Snapshot does not track falls back to ChatGPT. The
KPI cards report Northstar's Visibility Score, Share of Voice, and Average
Position for the selected Platform. The Visibility Score and the Share of Voice
carry the movement of the tracked window; the Average Position has none to
compare, because the Snapshot tracks no daily mention positions.

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
