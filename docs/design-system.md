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
never decorative. The one other colour in the app is the chart's series ramp:
every tracked brand wears a hue of its own there — the greyscale ramp is the
one exception, and it is a mode of that ramp — and nowhere else.

## Color tokens

### Source tones

| Token | Value | Use |
|-------|-------|-----|
| `--brand` | `#376CFF` | Profound Blue; the app's brand tone, and Northstar's series colour |
| `--ink` | `#050505` | the darkest tone: page base, and text on brand fills |

Every surface and text tone derives from these two, so a brand change is a
one-line change. Two things are the exception: the series ramp, whose
competitor hues are their own and where only `--chart-1` follows the brand, and
the two status tones — `--destructive` and `--positive` — which say what
happened, so they are literals and not derivations.

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
| `--positive` | `#4ADE80` | positive trend — the movement that went the good way (11.29:1 on `--card`) |
| `--border` | `#232327` | hairline dividers between panels and rows |
| `--input` | `#61616A` | control boundary (3.33:1 on `--background`, 3.21:1 on `--card`) |
| `--ring` | `#7395FF` | focus outline (7.25:1 on `--background`) |
| `--selection` | `color-mix(in oklab, var(--brand) 30%, transparent)` | text selection tint |
| `--radius` | `0.625rem` | panel and control radius |

### Series

| Token | Value | Use |
|-------|-------|-----|
| `--chart-1` | `var(--brand)` | Northstar (4.45:1 on `--card`) |
| `--chart-2` | `#D2963C` | competitor 1 — amber (7.65:1 on `--card`) |
| `--chart-3` | `#3AAE9E` | competitor 2 — teal (7.24:1 on `--card`) |
| `--chart-4` | `#B96FC4` | competitor 3 — orchid (5.74:1 on `--card`) |
| `--chart-5` | `#C96685` | competitor 4 — rose, unused today (5.36:1 on `--card`) |

Every brand wears a colour of its own, so the lines are told apart by colour.
The competitor hues are less saturated than the brand's, so they read as rivals
rather than as decoration, and the series separate by line treatment as well,
so colour is never the only signal. **Every series colour is a hue**: the
neutral ramp of the surfaces is not a series colour. The greyscale ramp below
is the one exception, and it earns it — it is a mode's own set of tokens, and
its steps are told apart by their lightness and by their line pattern.

The greyscale ramp is what the chart's greyscale mode wears: the reader takes
the hue off the competitors, and the brand keeps `--chart-1`, so the brand's
line is the one hue left on the plot. The greys are ten points of lightness
apart, so the rivals are still told apart by their lightness and by their line
pattern — never by a hue of their own, and never by one grey between them. The
brand has no grey of its own: it is the hue the mode leaves.

| Token | Value | Use |
|-------|-------|-----|
| `--chart-2-grey` | `#B4B4BE` | competitor 1 without its hue (9.56:1 on `--card`) |
| `--chart-3-grey` | `#9898A2` | competitor 2 without its hue (6.88:1 on `--card`) |
| `--chart-4-grey` | `#7C7C86` | competitor 3 without its hue (4.76:1 on `--card`) |
| `--chart-5-grey` | `#62626C` | competitor 4 without its hue, unused today (3.26:1 on `--card`) |

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
- Every series colour clears 3:1 against `--card`; every brand wears a colour
  of its own, and the series separate by line treatment as well, so no two
  series are told apart by hue alone.
- The chart ramp is assigned per brand — Northstar takes `--chart-1`, and the
  competitors take `--chart-2` onwards, one token of the ramp per brand, in
  order. A brand keeps its colour and its line pattern when the Platform
  changes, so the same brand is the same series in every view.
- The brand the Snapshot measures wears the heaviest line on the plot, and the
  legend groups it under `Your brand` while the competitors sit under
  `Competitors`. The reader is told which line is the reader's own in words,
  and not only by the colour of that line.
- The greyscale mode takes the hue off the competitors and leaves the brand
  alone, so the brand's line is the one hue on the plot. It is a second set
  of tokens, not a filter: the competitor hues stay in the ramp, and the
  reader switches between the two.

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
- **Pointer** says the element is clickable: a control that answers a click
  shows the pointer cursor on hover. The browser gives a hyperlink the
  pointer for free and gives a button nothing, so a button left without this
  rule reads as text — the chart's legend, whose series toggles wear the
  quiet variant, is the clearest case. The badge states the pointer itself,
  and only in the interactive rendering it has, the link rendering — the
  same form its hover belongs to — so the anchor that is not a hyperlink
  shows the pointer too. The app renders the badge inert today, and an
  inert badge never shows one. An element that is not clickable keeps the
  default cursor.
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

These are the conventions the dashboard is built against; the shell, the
overview's surfaces, and the prompt detail route's surfaces exist today, and
the rest arrive with their own tickets.

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Base | `< 640px` | single column; KPI cards stack; the prompt table becomes cards; the chart keeps at least `h-60` of height with fewer labels |
| `sm` | `≥ 640px` | KPI cards in a 3-column grid; table view returns |
| `md` | `≥ 768px` | two-column detail layout (answer + citations) |
| `lg` | `≥ 1024px` | full dashboard density |

The whole flow has to work from ~390px to desktop without horizontal overflow.
The end-to-end smoke suite holds that floor: it opens the overview at 390px
and asserts that the prompt table is there but hidden, that a row is still
reachable as a link, and that the page does not scroll sideways.

## Component inventory

The inventory is capped. A new component needs a product need, not a style
preference.

| Component | Path | States |
|-----------|------|--------|
| Badge | `src/components/ui/badge.tsx` | default, secondary, outline, ghost, destructive, link; hover (link rendering), invalid, disabled, pointer (link rendering) |
| Button | `src/components/ui/button.tsx` | default, outline, secondary, ghost, destructive, link; hover, focus-visible, disabled, invalid, pointer |
| Card | `src/components/ui/card.tsx` | default; hover when the card sets `data-interactive`; disabled when the card sets `aria-disabled` |
| Table primitives | `src/components/ui/table.tsx` | default; hover when a row sets `data-interactive`; selected when a row sets `data-state="selected"`; disabled when a row sets `aria-disabled` |
| Skeleton | `src/components/ui/skeleton.tsx` | default — inert, it has no interactive states |
| Segmented control | `src/components/ui/segmented-control.tsx` | default, hover, focus-visible, selected (the segment carries `aria-pressed`), disabled, pointer |
| Popover | `src/components/ui/popover.tsx` | default; the trigger carries hover, focus-visible and pointer |

The vocabulary is shared; each component implements the states in its
inventory row.

| State | How it is expressed |
|-------|---------------------|
| default | the variant's own surface and text tokens |
| hover | a quiet surface shift to `--muted` with the foreground text; a filled variant shifts its own fill; a link underlines |
| pointer | `cursor-pointer` on the control that answers a click — the button, the segmented control's segment, the badge in its link rendering, where it covers the anchor that is not a hyperlink, and the popover's trigger. An element that is not clickable keeps the default cursor. |
| focus-visible | the global outline — a component never draws one and never suppresses one |
| disabled | `opacity-50` plus no pointer affordance: `disabled:` on a native control, `aria-disabled:` on anything else |
| invalid | a `--destructive` border and a 3px `--destructive` ring at 40% opacity |
| selected | `bg-secondary` plus `text-foreground`, on the hairline the element already carries |

The components are generated with the shadcn CLI and restyled against this
document: the CLI's `focus-visible:ring-*` and `outline-none` utilities are
stripped, `bg-accent` chrome becomes `bg-secondary` or `bg-muted`, an
overlay's `ring-foreground/10` becomes the `--border` hairline, and the
`dark:` duplicates go — the app is dark-only, so the `dark:` variant is the
only one that ever applies. The documentation is not a class source: it is
excluded from the scan in `src/app/globals.css`, so the utilities it names as
examples never reach the stylesheet.

The button's variants are `default`, `outline`, `secondary`, `ghost`,
`destructive` and `link`, on four sizes: `default` (32px), `sm` (28px), `lg`
(36px) and `icon` (32px square). The badge is a `<span>`, so it is not
interactive: its hover and its pointer belong to the link rendering
(`render={<a />}`), and it dims through `aria-disabled`. The card is a panel,
not a control: it adds no focus ring of its own, and its padding rhythm lives
in one CSS variable (`--card-spacing`) so a denser card is a class, not a
variant. The segmented control holds no domain state: the group is
single-select and takes its pressed values as an array through `value`,
reporting them through `onValueChange` — the way Base UI's toggle group
models them — and a segment expresses its selection as `aria-pressed`. The
Platforms the segments stand for are bound to the control by the platform
scope control, below.

**The popover** (`src/components/ui/popover.tsx`) is the overlay the app reads
a secondary piece of copy from — a metric's explanation, today. It opens on a
click and on a tap, and a trigger can ask for it to open on a hover as well.

The popover is the overlay, and the hover-only label is not: a label of that
kind answers a pointer and nothing else — it is disabled on touch devices,
and the copy inside it is never announced. A popover opens on a click, so the
reader reaches it with a tap or with the keyboard, and its popup is a dialog
with a name and a description, so a screen reader reads it. The card's
information icon is a popover for that reason: the explanation is worth
reading on a phone. The chart's tooltip is a different thing — a drawing
inside the plot, not an overlay the reader opens.

The trigger is a control — it takes focus and it answers a click — so it
carries the pointer, the affordance the button, the segmented control's
segment and the badge's link rendering carry.

The popup is an overlay: it wears `--popover` with `--popover-foreground` on
it, the hairline `--border` around it and a shadow, the way the popover
token is meant to be used. The shadcn CLI slides and zooms the popup in; the
app asks for restrained motion, so the popup fades.

## The overview's surfaces

Four surfaces compose the base components; none adds to the inventory above.

**The platform scope control** (`src/components/platform-scope.tsx`)
is the segmented control bound to the Platforms the Snapshot tracks. The group
carries the accessible name (`Platform`); each segment is named by its own
label. The selected Platform holds the group's single tab stop, so tabbing
into the control lands on it. The scope follows the focus between the
segments, the way a radio group behaves: the arrow keys move between the
Platforms and the filter changes with them. The control is shared: the
overview and the prompt detail route both scope by it, so it lives outside
the overview's folder.

**The KPI cards** (`src/components/overview/kpi-card.tsx`) are cards, not new
components: the metric's name in the label role, the value in the display
metric role, and the movement in the micro role. A movement carries its
direction in the mark that points it, in the colour that names it, and in
the words a screen reader reads, so colour is never the only signal. The
colour follows the direction of the number: up is `--positive`, down is
`--destructive`, and a movement of nothing keeps the muted foreground. Both
metrics that report a movement are ones where more is better — the Average
Position has none, because the Snapshot tracks no daily mention positions.

A movement has three states — up, down and no change — and the card renders
all three. A downward movement takes the `--destructive` colour, because it
is the one the reader has to act on: the Snapshot holds a Platform where the
measured brand's movement goes down, so the state is one the demo reaches,
not one it only documents. No tracked window moves by nothing, so "no change"
is a state the card implements rather than one the data reaches. A movement
with no earlier period to compare renders the em dash, with the reason a
screen reader reads.

The metric's name is a label with an explanation behind it. Beside the name
sits the information icon, and the popover it opens carries the metric's
explanation: hovering it opens the popover, and so does a click or a tap. The
explanation repeats the metric's definition in `GLOSSARY.md`, in the
glossary's vocabulary. The icon carries an accessible name that says which
metric it explains, so the explanation is reachable without seeing the icon
at all, and the popover's own title and description name the metric and its
explanation to a screen reader.

**The visibility chart** (`src/components/overview/visibility-chart.tsx`) is
the overview's third surface: the Visibility Score over the tracked window,
for the selected Platform. It is a card — the title names the metric, the
description names the Platform and the tracked window — drawn with Recharts
and the chart ramp. It composes the base components; it adds no component, and
it wears the ramp — the colour ramp and the greyscale one — rather than a
colour of its own.

- Northstar wears `--chart-1` and a solid line that is heavier than any
  competitor wears: the line the reader is looking for is the heaviest one on
  the plot, and weight is the signal that survives a greyscale plot, a
  projector and a phone. The competitors take the ramp from `--chart-2`
  (`--chart-5` is the ramp's reserved fourth step), each in a colour of its
  own — amber, teal, orchid — and separate by line pattern as well: a long
  dash, a fine dot, and a dash-dot, so no two series are told apart by hue
  alone.
- **The chart carries a greyscale mode.** The toggle is the button
  `Greyscale competitors`, and it sits in the card's action slot, beside the
  chart's title. It carries `aria-pressed`: a chart control, not a series
  toggle, so the legend still holds nothing but the series. Switched on, the
  competitors wear the greyscale ramp and the brand keeps `--chart-1`, so the
  brand's line is the one hue on the plot — the reader's way of asking for
  their own line and nothing else. The mode is a view choice: it survives a
  change of Platform the way the legend's hidden series do.
- The legend is a real control, not a static key: a group named `Series`
  holding a toggle per series, each carrying `aria-pressed`, and a hidden
  series leaves the plot and the tooltip as well. The choice survives a change
  of Platform. The toggles are the base button in its selected and its quiet
  rendering, so the legend holds no chrome of its own.
- **The legend is grouped: the brand and the competitors are named.** The brand
  the Snapshot measures sits under a `Your brand` label and the rivals under a
  `Competitors` label, and each of the two is a group in the accessibility
  tree, named by the label it shows. The reader is told which line is the
  reader's own in words, and not only by the colour of that line.
- The reference each series wears in the legend and in the tooltip is a
  sample of the line it names: the series' own stroke width and the series'
  own dash, and at least as wide as the longest pattern's cycle, so the whole
  treatment stays inside the sample. A reference too short to carry the dash
  is a reference that cannot name the line.
- The tooltip is a custom component, never Recharts' default chrome: the
  hovered day as its heading, then one row per visible series with its exact
  tracked score, in the legend's order. The scores are the tracked ones, so
  the chart and the KPI cards cannot disagree about a day they share — the
  Visibility Score card reports Northstar's score on the last tracked day.
- The vertical axis is fixed at 0–100 and labelled in percent, so the series
  move and the axis does not. The horizontal axis carries the tracked days,
  thinned by `minTickGap` so the labels thin out instead of overlapping at
  390px.

The colours are CSS custom properties, so no raw colour reaches the DOM. The
dates are formatted from their ISO parts, not through `Date`, so the day never
shifts with the reader's time zone. The plot keeps at least `h-60` of height
below `sm`, and a Platform with no tracked window renders the em dash instead
of an empty plot — the mark this document reserves for a value the Snapshot
cannot report. Every Platform the Snapshot holds carries a window, so the chart
never draws it.

The chart is a client component: the charting library measures its
container, so the chart cannot be rendered on the server.

**The prompt table** (`src/components/prompts/prompt-table.tsx`) is the
read-only view of the tracked Prompts: one row per Prompt, the Prompt's
category in the secondary badge (`--secondary`), and a column per Platform
carrying the brand's Mention state on that Platform. The state has three
marks, and the em dash covers the two states the Snapshot cannot report:

| Mention state | Mark | Label a screen reader reads |
|---------------|------|------------------------------|
| mentioned | the brand accent as a fill (`--accent`), with the position the brand was named at | "Mentioned on ChatGPT, at position 1" |
| not mentioned | a hollow ring in `--muted-foreground` | "Not mentioned on ChatGPT" |
| the Platform gave no Answer | the em dash in `--muted-foreground` | "No answer on ChatGPT" |
| the Snapshot measures no brand | the em dash in `--muted-foreground` | "No brand to measure on ChatGPT" |

The em dash is this document's mark for a value the Snapshot cannot report,
and the ring says the Answer exists and does not name the brand. The three
marks are three shapes, so the state never rests on colour alone, and every
cell carries the label a screen reader reads.

The table is scoped by the Platform the overview's scope holds: the selected
Platform's column sits on the selected chrome (`--secondary`) and its head
reads in the foreground colour, and the rows are ordered by the brand's
strength on that Platform — a Prompt whose Answer names the brand first, the
earlier position first among them, then the Prompts the Platform answered
without naming it, and last the Prompts with no Answer to read. The order is
a default, not a setting: there is no sort control, and Prompts the Platform
ranks equally keep the Snapshot's own order.

Below `sm` the table gives way to a list of cards — the Card primitive, one
per Prompt, at the denser `--card-spacing` — the way the responsive
conventions say it does: the Prompt's text, its category badge, and the
Platforms in two columns, each with the same mark. The card is a panel like
the one that holds the table: a `--card` surface with the panel's radius,
and it carries `data-interactive`, so it hovers the way a card does. The
card marks the scoped Platform in its label — the foreground colour instead
of the muted one, and the label a screen reader reads — rather than with the
column's fill.

Every row is a link into the prompt detail route. The link carries the
Prompt's own text, so the row keeps one tab stop, and it carries a hidden
" (prompt detail)" after it, so the name a screen reader reads says what
the row opens. The link is stretched over the row — over the card below
`sm` — so a click anywhere on the row opens the Prompt's detail. The row
and the card each carry `data-interactive`, and the primitive they are
made of draws its own hover: the table primitives for the row, the Card
primitive for the card. The link underlines on hover the way a link does.
The link carries the Platform the table is scoped to, so the detail route
answers with the Platform the reader was looking at.

A row is activated by Enter and by Space, and the app activates it for both:
the browser's own Enter activation is prevented, so the row is not opened
twice. A press that repeats is the key held down: the row does not open
again, and the browser's default is kept off, so a held Space does not
scroll the page and a held Enter does not fill the history with the same
URL. A press with a modifier is left to the browser.

## The prompt detail route's surfaces

The prompt detail route (`/prompts/<prompt-id>`) is the app's first surface
outside the overview. It renders on the server from the Snapshot: the Prompt
comes from the path, the Platform from the `platform` search param, and a Prompt
the Snapshot does not track — or a Platform with no Answer for it — is a
404.

**The route's way back.** The route opens with a link back to the overview,
scoped to the Platform the route is showing, so the reader comes back to the
scope they drilled down from. It is a link and not a control that announces
itself as a button — a control that navigates has to say so — and it wears the
Button's `link` variant with the default size's own padding dropped, so its
text sits on the page's edge with the rest of the route.

**The answer panel** (`src/components/prompts/answer-panel.tsx`) renders the
Answer's segments — the Snapshot's own segmentation, so the Mentions on the
panel are the ones the KPI cards count. A Mention carries one of two
treatments:

| Mention | Treatment | Label a screen reader reads |
|---------|-----------|------------------------------|
| Northstar | the brand accent as a fill, with `--accent-foreground` on it | "the brand being measured" |
| a Competitor | the foreground colour with a dotted underline in `--muted-foreground` | "competitor" |

Northstar is a fill rather than accent-coloured text: accent text on `--card`
sits at 4.45:1, under the AA this document asks of body text, and the fill
carries the accent foreground at 4.61:1. The two treatments differ by fill,
text colour, and line treatment, so colour is never the only signal — and
each one carries a hidden label that says what the treatment says.

A Citation marker in the body (`[1]`) links to that Citation's entry in the
citations panel. Its accessible name starts with the marker, so the name a
screen reader reads contains the text on screen.

**The citations panel** (`src/components/prompts/citations-panel.tsx`) lists
the Answer's sources in the order of the markers, so the number in the body
is the number in the list. The list is an ordered list with its own markers —
a flex container would drop them. A source with a web address is an external link that opens
in a new tab with `rel="noopener noreferrer"`, its accessible name is the
title plus a hidden "opens in a new tab"; a source whose URL is not a web
address is rendered as text rather than as a link. The panel ends with
the note that says where the sources come from: they are the fixture's
fictional publications on reserved example domains.

**The route's layout and its loading UI.** Above the content, a scope row
carries the selected Platform's name and the day the Snapshot's Answers
belong to, with the scope control beside it. The answer and the citations
sit side by side from `md` in a 3:2 grid and stack below it, in the shared
layout (`src/components/prompts/prompt-detail-layout.tsx`). Switching the Platform
is a navigation — the URL carries it and the server answers with that
Platform's Answer — so the route shows one skeleton
(`src/components/prompts/prompt-detail-skeleton.tsx`) while the answer is on
its way. The skeleton stands in for the content inside that same layout, so
the page does not jump when the content arrives. The scope control stays
interactive during the wait.

## Accessibility rules

- Body and label text meets WCAG AA on `--background` and `--card`.
- Brand fills carry `--primary-foreground` / `--accent-foreground`.
- Colour is never the only signal: a movement carries the mark that points it
  and the words beside it, mentions carry brand labels, chart series differ by
  colour, lightness and line treatment.
- A popover's trigger carries an accessible name that says what it explains,
  so the icon is not the only clue, and the popup is a named dialog with a
  description, so a screen reader reads it.
- The chart's legend carries its state in `aria-pressed`, so a hidden series
  is readable without colour, and the tooltip names the day and every visible
  series. The legend groups the brand and the competitors under the labels it
  shows, and each group is a group in the accessibility tree, so the reader is
  told which line is the reader's own without reading a colour.
- Focus is always visible and is drawn by the global outline.
- Controls (inputs, selects, textareas) set `border-input`; the universal
  `border-border` rule colours dividers only. `--input` clears 3:1 against
  both `--background` and `--card`.
- Every chart series clears 3:1 against `--card`.
- The chart's greyscale mode carries its state in `aria-pressed` too, so the
  reader knows the rivals have lost their hue without seeing it.
- The chart's plot is an image with a description: it names the metric, the
  brands and the Platform, so a screen reader does not read the axis ticks as
  the chart's name. The legend is the chart's control.

## Data semantics

- Northstar uses `--accent` and `--chart-1`.
- Competitors use the chart ramp — a colour of their own — plus a distinct
  line treatment.
- The greyscale mode wears the greyscale ramp on the competitors alone:
  Northstar keeps `--chart-1` in both modes, so the brand's line is the one
  hue on the plot.
- Missing or undefined metrics render as an em dash (`—`), never `NaN`.
- A movement with no earlier period to compare against renders as an em dash
  too, and says so to a screen reader.
- The movement beside the Share of Voice is the movement of the tracked
  window's score-derived share of voice, which equals the mention share while
  no Answer names a brand twice.
- The chart's tooltip shows the tracked score to one decimal and says the day
  it belongs to.
- A brand that goes untracked on a day has no point on that day: the series
  breaks and the tooltip leaves it out. It is never a zero, which would read
  as a real measurement. The Snapshot tracks every brand on every day of its
  window, so this is a promise the derivation layer keeps rather than a state
  the chart reaches today.
