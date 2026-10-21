# AI Visibility Snapshot

A deterministic, dark-only dashboard for the fictional brand **Northstar**: how often, and how prominently, the brand shows up in AI-generated answers.

> **All data is simulated.** Every figure in this app comes from a fixed, fictional snapshot. Nothing here is collected live from ChatGPT, Claude, Gemini, Perplexity, or any other platform.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI preset, `components.json`).

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
npm run build
```

`npm run build` produces a production bundle; run it with `npm run start` to serve that bundle locally.

## What the app renders today

The dark app shell: a header with the product name and a "Simulated data" badge.

## Adding shadcn/ui components

```bash
npx shadcn add <component>
```

The CLI reads `components.json`; components land in `src/components/ui/`.
