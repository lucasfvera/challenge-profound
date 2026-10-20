# Design System — AI Visibility Snapshot

This document is the **source of truth** for the visual language. Tokens live in
`src/app/globals.css`; components consume them through semantic Tailwind
utilities (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`).
No call site may introduce a raw color. Changing a token value changes the app,
so this table changes in the same commit.

The UI is **dark-only by deliberate choice**. There is no light mode and no
theme switcher: the token values live on `:root`, and the `dark` class stays on
`<html>` so `dark:` utilities resolve for every descendant.

## Direction

A black base with a single Profound Blue accent, hairline borders, dense
tabular data, and restrained motion. The accent means **Northstar** — it is
never decorative.

## Color tokens

### Source tones

| Token | Value | Use |
|-------|-------|-----|
| `--brand` | `#376CFF` | Profound Blue; the only brand color in the app |
| `--ink` | `#050505` | the darkest tone: page base, and text on brand fills |

Everything else derives from these two, so a brand change is a one-line change.

### Surfaces and text

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `var(--ink)` | page background |
| `--foreground` | `#F4F4F5` | primary text (18.54:1 on `--background`) |
| `--card` | `#0B0B0D` | panels, tables, KPI cards |
| `--card-foreground` | `var(--foreground)` | text on cards |
| `--popover` | `#101013` | overlays |
| `--popover-foreground` | `var(--foreground)` | text on overlays |
| `--muted` | `#121214` | quiet surface: hover fill, table header fills, card footers, skeletons |
| `--muted-foreground` | `#9A9AA3` | secondary text and labels (7.30:1 on `--background`) |
| `--secondary` | `#17171A` | secondary variant fill; selected chrome |
| `--secondary-foreground` | `#E6E6E9` | text on secondary |
| `--secondary-hover` | `color-mix(in oklab, var(--secondary), var(--foreground) 5%)` | hover fill for a surface that already rests on `--secondary` |

### Brand, lines, and focus

| Token | Value | Use |
|-------|-------|-----|
| `--primary` | `var(--brand)` | primary action; Northstar series |
| `--primary-foreground` | `var(--ink)` | text on a brand fill (4.61:1) |
| `--accent` | `var(--brand)` | brand meaning only: Northstar mentions, Northstar data |
| `--accent-foreground` | `var(--ink)` | text on the accent |
| `--destructive` | `#FF6464` | negative trend, destructive action |
| `--destructive-foreground` | `#1A0505` | text on destructive |
| `--border` | `#232327` | hairline dividers between panels and rows |
| `--input` | `#61616A` | control boundary (3.33:1 on `--background`, 3.21:1 on `--card`) |
| `--ring` | `#7395FF` | focus outline (7.25:1 on `--background`) |
| `--selection` | `color-mix(in oklab, var(--brand) 30%, transparent)` | text selection tint |
| `--radius` | `0.625rem` | panel and control radius |

### Series

| Token | Value | Use |
|-------|-------|-----|
| `--chart-1` | `var(--brand)` | Northstar |
| `--chart-2` | `#A1A1AA` | competitor 1 (7.67:1 on `--card`) |
| `--chart-3` | `#8B8B95` | competitor 2 (5.83:1 on `--card`) |
| `--chart-4` | `#75757F` | competitor 3 (4.31:1 on `--card`) |
| `--chart-5` | `#62626C` | competitor 4 (3.26:1 on `--card`) |

The sidebar tokens (`--sidebar*`) alias the same surfaces; they exist so
shadcn's sidebar primitives stay on-contract.

### Rules

- `--accent` is an alias of `--brand`: both resolve to Profound Blue. The
  difference is intent, not colour — `--primary` is the primary action,
  `--accent` is brand data (Northstar).
- The accent is reserved for Northstar and for primary actions. Hover and
  selected chrome use `--secondary` / `--muted`: shadcn's default `bg-accent`
  recipe would paint the brand blue, so it is not used for chrome states.
- Never put `--foreground` on `--primary` (4.02:1 — below AA). A brand fill
  always carries `--primary-foreground` or `--accent-foreground`.
- Every series colour clears 3:1 against `--card`; competitors are separable
  by lightness and by line treatment, not by hue.

## Typography

One family: **Inter**, a neo-grotesque sans. It is self-hosted from
`src/app/fonts/Inter-Variable.woff2` through `next/font/local`, so the
production build never calls a font CDN — `next/font/google` hard-fails the
build when Google Fonts is unreachable. The variable font carries the `wght`
axis 100–900 and the `opsz` axis 14–32; optical sizing is left on automatic.

Coverage: the bundled file is the Google Fonts latin subset — Latin-1 plus
General Punctuation, so `—` and `·` are covered, and a few extras such as `↑`
and `↓`. It does **not** include `→` (U+2192), Greek, Cyrillic, or Latin
Extended-A. Glyphs outside the subset fall back to the system sans, so new copy
stays inside it and symbols come from `lucide-react` icons rather than from
glyphs.

### Type scale

| Role | Class | Size / line-height | Use |
|------|-------|--------------------|-----|
| Display metric | `text-3xl font-semibold tracking-tight tabular-nums` | 30 / 36 | KPI values |
| Page title | `text-2xl font-semibold tracking-tight` | 24 / 32 | route headings |
| Section title | `text-sm font-semibold tracking-tight` | 14 / 20 | panel headers; the header product name |
| Body | `text-sm leading-6` | 14 / 24 | prose |
| Compact body | `text-sm leading-5` | 14 / 20 | table cells |
| Label | `text-xs font-medium uppercase tracking-widest` | 12 / 16 | eyebrows |
| Column label | `text-xs font-medium uppercase tracking-wide` | 12 / 16 | dense table heads |
| Micro | `text-xs leading-4` | 12 / 16 | badges, captions |

### Tabular numerals

Numbers must align in columns.

- Tables and `<time>` elements get tabular figures from the base layer; no
  extra class is needed.
- Metrics, deltas, and other numeric text outside a table add the
  `tabular-nums` utility.
- The shell has no numeric surface yet; the KPI cards are the first consumer
  of these rules.

## Focus and interaction states

- **One focus system.** The base layer draws focus once: a 2px `--ring`
  outline with a 2px offset. Components do not add their own focus rings or
  focus-tinted borders — the shadcn CLI writes `focus-visible:ring-*` into every
  component it generates, and those utilities are stripped when a component
  lands. The CLI also writes `outline-none`, and that utility is stripped too:
  it sits in the utilities layer and would kill the base-layer outline, so a
  component that suppresses the outline suppresses the only focus affordance
  in the app.
- **Hover** is a quiet surface shift: chrome moves to `--muted` with the
  foreground text, and a filled variant shifts its own fill (`bg-primary/80`
  for a brand fill, `bg-destructive/20` for a destructive one,
  `bg-secondary-hover` for a secondary one). A link underlines instead of
  shifting a surface. Hover never reaches for the brand accent.
  `--secondary` is the lightest quiet surface in the ramp, so a control that
  already rests on it takes the `--secondary-hover` mix on hover instead of
  dimming its own fill — dimming a near-black fill reads as a press, not a
  hover.
- **Selected** chrome uses `bg-secondary` plus `text-foreground`, on the
  hairline it already carries — a table row's divider, a segment's track. The
  accent stays out of chrome. A hover rule must not reach the selected
  surface: scope the hover to the unselected state
  (`hover:not-aria-pressed:…`) instead of relying on the cascade, where a
  hover selector outranks the selected one.
- **Disabled** reduces opacity (`opacity-50`) and drops the pointer
  affordance. The label token still has to clear AA before the dimming —
  inactive controls are exempt from the contrast requirement (WCAG 1.4.3).
  A native control uses `disabled:`; anything else uses `aria-disabled:`.
- **Invalid** is a state, not a focus state: a `--destructive` border plus a
  3px `--destructive` ring at 40% opacity.
- **Selection** uses `--selection` — the accent at 30% — with `--foreground`
  as the selected text colour. This is the one sanctioned use of the brand
  outside Northstar data.

## Spacing and layout

- Horizontal page padding: `px-4` (`sm:px-6`); vertical page padding `py-10`.
- Content max width: `max-w-6xl`, centered.
- Header row: `h-14` tall, its items separated by `gap-4`.
- Vertical rhythm: `gap-6` (24px) between panels, `gap-2`..`gap-3` (8–12px)
  inside compact rows.
- Dividers: `border-border`. Shadows only for focus and overlays.
- Radii come from `--radius`: `rounded-lg` for panels, `rounded-md` for
  controls, `rounded-4xl` for pills. A control nested inside another control —
  a segment inside a segmented control's track — takes `rounded-sm` on its
  outer corners, the outer radius minus the inset, so the inner curve follows
  the outer one.

## Responsive conventions

These are the conventions the dashboard is built against; only the shell and
the overview's surfaces exist today, and the rest arrive with their own
tickets.

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Base | `< 640px` | single column; KPI cards stack; the prompt table becomes cards; the chart keeps at least `h-60` of height with fewer labels |
| `sm` | `≥ 640px` | KPI cards in a 3-column grid; table view returns |
| `md` | `≥ 768px` | two-column detail layout (answer + citations) |
| `lg` | `≥ 1024px` | full dashboard density |

The whole flow has to work from ~390px to desktop without horizontal overflow.

## Component inventory

The inventory is capped. A new component needs a product need, not a style
preference.

| Component | Path | States |
|-----------|------|--------|
| Badge | `src/components/ui/badge.tsx` | default, secondary, outline, ghost, destructive, link; hover (link rendering), invalid, disabled |
| Button | `src/components/ui/button.tsx` | default, outline, secondary, ghost, destructive, link; hover, focus-visible, disabled, invalid |
| Card | `src/components/ui/card.tsx` | default; hover when the card sets `data-interactive`; disabled when the card sets `aria-disabled` |
| Table primitives | `src/components/ui/table.tsx` | default; hover when a row sets `data-interactive`; selected when a row sets `data-state="selected"`; disabled when a row sets `aria-disabled` |
| Skeleton | `src/components/ui/skeleton.tsx` | default — inert, it has no interactive states |
| Segmented control | `src/components/ui/segmented-control.tsx` | default, hover, focus-visible, selected (the segment carries `aria-pressed`), disabled |

The vocabulary is shared; each component implements the states in its
inventory row.

| State | How it is expressed |
|-------|---------------------|
| default | the variant's own surface and text tokens |
| hover | a quiet surface shift to `--muted` with the foreground text; a filled variant shifts its own fill; a link underlines |
| focus-visible | the global outline — a component never draws one and never suppresses one |
| disabled | `opacity-50` plus no pointer affordance: `disabled:` on a native control, `aria-disabled:` on anything else |
| invalid | a `--destructive` border and a 3px `--destructive` ring at 40% opacity |
| selected | `bg-secondary` plus `text-foreground`, on the hairline the element already carries |

The components are generated with the shadcn CLI and restyled against this
document: the CLI's `focus-visible:ring-*` and `outline-none` utilities are
stripped, `bg-accent` chrome becomes `bg-secondary` or `bg-muted`, and the
`dark:` duplicates go — the app is dark-only, so the `dark:` variant is the
only one that ever applies. The documentation is not a class source: it is
excluded from the scan in `src/app/globals.css`, so the utilities it names as
examples never reach the stylesheet.

The button's variants are `default`, `outline`, `secondary`, `ghost`,
`destructive` and `link`, on four sizes: `default` (32px), `sm` (28px), `lg`
(36px) and `icon` (32px square). The badge is a `<span>`, so it is not
interactive: its hover belongs to the link rendering (`render={<a />}`), and
it dims through `aria-disabled`. The card is a panel, not a control: it adds
no focus ring of its own, and its padding rhythm lives in one CSS variable
(`--card-spacing`) so a denser card is a class, not a variant. The segmented
control holds no domain state: the group is single-select and takes its
pressed values as an array through `value`, reporting them through
`onValueChange` — the way Base UI's toggle group models them — and a segment
expresses its selection as `aria-pressed`. The Platforms the segments stand
for are bound to the control by the overview, below.

## The overview's surfaces

Two surfaces compose the base components; neither adds to the inventory above.

**The platform scope control** (`src/components/overview/platform-scope.tsx`)
is the segmented control bound to the Platforms the Snapshot tracks. The group
carries the accessible name (`Platform`); each segment is named by its own
label. The selected Platform holds the group's single tab stop, so tabbing
into the control lands on it. The scope follows the focus between the
segments, the way a radio group behaves: the arrow keys move between the
Platforms and the filter changes with them.

**The KPI cards** (`src/components/overview/kpi-card.tsx`) are cards, not new
components: the metric's name in the label role, the value in the display
metric role, and the movement in the micro role. A movement carries its
direction in an icon and in the words a screen reader reads, so colour is
never the only signal.

## Accessibility rules

- Body and label text meets WCAG AA on `--background` and `--card`.
- Brand fills carry `--primary-foreground` / `--accent-foreground`.
- Colour is never the only signal: trends carry up/down/neutral text, mentions
  carry brand labels, chart series differ by lightness and line treatment.
- Focus is always visible and is drawn by the global outline.
- Controls (inputs, selects, textareas) set `border-input`; the universal
  `border-border` rule colours dividers only. `--input` clears 3:1 against
  both `--background` and `--card`.
- Every chart series clears 3:1 against `--card`.

## Data semantics

- Northstar uses `--accent` and `--chart-1`.
- Competitors use the neutral chart ramp plus a distinct line treatment.
- Missing or undefined metrics render as an em dash (`—`), never `NaN`.
- A movement with no earlier period to compare against renders as an em dash
  too, and says so to a screen reader.
- The movement beside the Share of Voice is the movement of the tracked
  window's score-derived share of voice, which equals the mention share while
  no Answer names a brand twice.
