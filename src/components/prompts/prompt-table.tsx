"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { promptDetailHref, rowActivation } from "@/lib/prompt-row";
import type { RowPress } from "@/lib/prompt-row";
import { promptTableRows } from "@/lib/prompt-table";
import type { MentionState, PromptRow } from "@/lib/prompt-table";
import { CATEGORY_LABELS } from "@/lib/snapshot/categories";
import { snapshot } from "@/lib/snapshot";
import type {
  Platform,
  PlatformId,
  Prompt,
  PromptCategory,
} from "@/lib/snapshot";
import { cn } from "@/lib/utils";

/**
 * The prompt table: every tracked Prompt, with Northstar's Mention state on
 * each Platform.
 *
 * The table is the read-only exploration view of the Snapshot. It reads the
 * rows through the prompt table contract, so the Mentions it shows are the
 * Mentions the KPI cards count, and it takes the selected Platform from the
 * caller — the scope the overview already holds — so the two halves of the
 * page never show different Platforms.
 *
 * Every row is a link into the detail route. The link carries the Prompt's
 * own text and is stretched over the row, so a click anywhere on the row
 * opens the Prompt's detail — the Answer that Platform gave for it.
 *
 * Below `sm` the table gives way to a list of cards, the way the design
 * system's responsive conventions say it does. Both layouts render the same
 * rows and the stylesheet picks one, so the page never overflows sideways.
 */
export function PromptTable({ platformId }: { platformId: PlatformId }) {
  const rows = promptTableRows(snapshot, platformId);
  const platforms = snapshot.platforms;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracked prompts</CardTitle>
        <CardDescription>
          Every tracked Prompt, with Northstar&apos;s Mentions on each
          Platform. The rows are ordered by Northstar&apos;s strength on the
          selected Platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PositionKey />

        <ul className="grid gap-3 sm:hidden">
          {rows.map((row) => (
            <li key={row.prompt.id}>
              <PromptCard row={row} platformId={platformId} />
            </li>
          ))}
        </ul>

        <div className="hidden sm:block">
          <Table>
            <TableCaption className="sr-only">
              The tracked Prompts, with Northstar&apos;s Mention state on each
              Platform.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Prompt</TableHead>
                <TableHead>Category</TableHead>
                {platforms.map((platform) => {
                  const selected = platform.id === platformId;

                  return (
                    <TableHead
                      key={platform.id}
                      className={cn(
                        selected && "bg-secondary text-foreground",
                      )}
                    >
                      <PlatformName platform={platform} selected={selected} />
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.prompt.id}
                  // The row is a link, so it carries the hover the table
                  // primitives draw for an interactive row.
                  data-interactive
                  // The row is the link's containing block: the link is
                  // stretched over the whole row, so a click anywhere on it
                  // opens the Prompt's detail.
                  className="relative"
                >
                  <TableCell className="whitespace-normal">
                    <PromptLink prompt={row.prompt} platformId={platformId} />
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={row.prompt.category} />
                  </TableCell>
                  {row.mentions.map((mention) => (
                    <TableCell
                      key={mention.platform.id}
                      className={cn(
                        mention.platform.id === platformId && "bg-secondary",
                      )}
                    >
                      <MentionIndicator
                        platform={mention.platform}
                        state={mention.state}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * The key the table's Mention marks are read through.
 *
 * The number on a Mention is a position, and a reader who does not know that
 * cannot read the table: `1, 2, 3` reads as a count of Mentions. The key
 * names the metric, says what the number is — the place Northstar was named
 * in the Platform's answer — and shows the two marks a position wears, each
 * named beside it, so the first position and the later ones are told apart
 * by more than their shape.
 *
 * The key is visible copy and not an overlay: the number is unclear to a
 * reader who never goes looking for the explanation, and an overlay answers
 * nobody who does not find it. It sits above the table and above the card
 * list, so both layouts read it.
 *
 * The marks it shows are the components the cells draw, so the key cannot
 * drift from the table.
 */
function PositionKey() {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs leading-4 text-muted-foreground">
      <span className="font-medium uppercase tracking-widest text-muted-foreground">
        Position
      </span>
      <span>the place Northstar was named in the Platform&apos;s answer</span>
      <span className="inline-flex items-center gap-1.5">
        <FirstPositionMark />
        named first
      </span>
      <span className="inline-flex items-center gap-1.5">
        {/* The example of a later position: the brand was named at it
            after another brand was named first. */}
        <PositionMark position={LATER_POSITION} />
        named after another brand
      </span>
    </div>
  );
}

/**
 * One Prompt as a card: the base layout of the table, for the widths where
 * the table gives way.
 *
 * The card carries the same marks as the table — the category badge, the
 * Mention state of each Platform, and the Platform the table is scoped to —
 * so the two layouts say the same thing. It carries the same link, so the
 * drill-down is the same either way.
 */
function PromptCard({
  row,
  platformId,
}: {
  /** The row the card shows. */
  row: PromptRow;
  /** The Platform the table is scoped to. */
  platformId: PlatformId;
}) {
  return (
    <Card
      // The card is the link's containing block: the link is stretched over
      // the whole card, so a click anywhere on it opens the Prompt's detail.
      className="relative px-(--card-spacing) [--card-spacing:--spacing(3)]"
      data-interactive
    >
      <p className="text-sm leading-5">
        <PromptLink prompt={row.prompt} platformId={platformId} />
      </p>
      <CategoryBadge category={row.prompt.category} />
      {/* The platforms fill the grid row by row, so the card reads in the
          same Platform order as the table's columns. */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        {row.mentions.map((mention) => {
          const selected = mention.platform.id === platformId;

          return (
            <div
              key={mention.platform.id}
              className="flex items-center justify-between gap-2"
            >
              <dt
                className={cn(
                  "text-xs",
                  selected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <PlatformName platform={mention.platform} selected={selected} />
              </dt>
              <dd>
                <MentionIndicator
                  platform={mention.platform}
                  state={mention.state}
                />
              </dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}

/**
 * The link a prompt row navigates through.
 *
 * The link carries the Prompt's own text, so the row keeps one tab stop and
 * a screen reader announces what the row is about. It is stretched over the
 * row — or over the card, below `sm` — so a click anywhere on the row opens
 * the Prompt's detail.
 *
 * The link carries the Platform the table is scoped to, so the detail route
 * answers with the Platform the reader was looking at.
 */
function PromptLink({
  prompt,
  platformId,
}: {
  /** The Prompt the link opens. */
  prompt: Prompt;
  /** The Platform the drill-down carries. */
  platformId: PlatformId;
}) {
  return (
    <Link
      href={promptDetailHref(prompt.id, platformId)}
      className="wrap-anywhere underline-offset-2 after:absolute after:inset-0 after:content-[''] hover:underline"
      onKeyDown={activateRow}
    >
      {prompt.text}
      <span className="sr-only"> (prompt detail)</span>
    </Link>
  );
}

/**
 * A key press that activates a prompt row.
 *
 * Enter and Space both open the row's detail, and the click is dispatched on
 * the link itself, so the row opens through the same path a mouse click
 * takes. The browser's own activation is kept off first, so the row is not
 * opened twice.
 */
function activateRow(event: KeyboardEvent<HTMLAnchorElement>) {
  const press: RowPress = {
    key: event.key,
    repeat: event.repeat,
    modified:
      event.metaKey || event.ctrlKey || event.altKey || event.shiftKey,
  };

  const activation = rowActivation(press);

  if (activation === "ignore") return;

  event.preventDefault();

  if (activation === "activate") event.currentTarget.click();
}

/**
 * The name of a Platform, marked when the table is scoped to it.
 *
 * The scope is marked with `aria-current` and with the label a screen reader
 * reads, so it never rests on colour alone.
 */
function PlatformName({
  platform,
  selected,
}: {
  /** The Platform to name. */
  platform: Platform;
  /** Whether the table is scoped to this Platform. */
  selected: boolean;
}) {
  return (
    <span aria-current={selected ? "true" : undefined}>
      {platform.name}
      {selected && <span className="sr-only"> (selected platform)</span>}
    </span>
  );
}

/**
 * The Mention state of one Answer.
 *
 * A Mention wears the brand accent as a fill — the accent is Northstar's
 * data — and carries the position Northstar was named at. The position the
 * brand was named first at wears a mark of its own, so the Platform that
 * named the brand before the others reads at a glance. A Prompt the
 * Platform answered without a Mention wears a hollow ring, and a value the
 * Snapshot cannot report shows the em dash the design system reserves for
 * it.
 *
 * The marks are shapes as well as colours, so the state never rests on
 * colour alone, and each one carries the label a screen reader reads.
 */
function MentionIndicator({
  platform,
  state,
}: {
  /** The Platform the state belongs to. */
  platform: Platform;
  /** The state to show. */
  state: MentionState;
}) {
  if (state.kind === "mentioned") {
    return (
      <>
        {state.position === FIRST_POSITION ? (
          <FirstPositionMark />
        ) : (
          <PositionMark position={state.position} />
        )}
        <span className="sr-only">
          {mentionedLabel(state, platform)}
        </span>
      </>
    );
  }

  if (state.kind === "absent") {
    return (
      <>
        <span aria-hidden="true" className="inline-flex items-center">
          <span className="size-2.5 rounded-full border border-muted-foreground" />
        </span>
        <span className="sr-only">{`Not mentioned on ${platform.name}.`}</span>
      </>
    );
  }

  return (
    <>
      <span
        aria-hidden="true"
        className="inline-flex items-center text-muted-foreground"
      >
        —
      </span>
      <span className="sr-only">{noDataLabel(state, platform)}</span>
    </>
  );
}

/**
 * The position the brand is named first at.
 *
 * The position is the ordinal of the brand's first Mention among the
 * Answer's Mentions, and `firstMentionPosition` in the derivation layer
 * produces it; 1 is the position the brand is named at before any other
 * brand. It is the one position the table gives a mark of its own, so it is
 * named once here and both the mark and the label read it.
 */
const FIRST_POSITION = 1;

/**
 * The position the key shows as the example of a later one.
 *
 * It is the position after the first: the brand was named at it after
 * another brand was named first.
 */
const LATER_POSITION = FIRST_POSITION + 1;

/**
 * The mark of a Mention at the position the brand was named first at.
 *
 * The first position wears the brand fill and carries the number inside it,
 * where every other position wears a dot with the number beside it. The two
 * are told apart by their shape, not only by their colour, so a row that
 * holds a first position and a later one never shows two cells styled the
 * same way — the Platform that named the brand before the others reads at a
 * glance.
 *
 * The fill is the brand accent: the accent is Northstar's data, and the
 * first position is Northstar's data, the same reason the answer panel
 * fills a Mention of the brand with it.
 */
function FirstPositionMark() {
  return (
    <span
      aria-hidden="true"
      // The hook names the element that renders the position number,
      // wherever the mark is drawn — in a cell and in the key — so the
      // smoke suite reads the two numbers the way a reader reads them.
      data-mention-position="first"
      className="inline-flex size-5 items-center justify-center rounded-full bg-accent text-xs font-semibold tabular-nums text-accent-foreground"
    >
      {FIRST_POSITION}
    </span>
  );
}

/**
 * The mark of a Mention that named the brand after another brand.
 *
 * The dot is the brand accent — the accent is Northstar's data — and the
 * position wears the muted foreground beside it.
 */
function PositionMark({
  position,
}: {
  /** The position the brand was named at. */
  position: number;
}) {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-1.5">
      <span className="size-2.5 rounded-full bg-accent" />
      <span
        // The hook names the element that renders the position number, the
        // way it names the first position's circle.
        data-mention-position="later"
        className="text-xs tabular-nums text-muted-foreground"
      >
        {position}
      </span>
    </span>
  );
}

/**
 * The label a screen reader reads for a cell the brand was mentioned in.
 *
 * The first position says so in words: the number alone does not tell a
 * reader that the brand was named before the others, and the mark the cell
 * wears is not the only signal the cell is allowed to rest on.
 */
function mentionedLabel(
  state: Extract<MentionState, { kind: "mentioned" }>,
  platform: Platform,
): string {
  if (state.position === FIRST_POSITION) {
    return `Mentioned on ${platform.name}, at position ${FIRST_POSITION}. The brand was named first.`;
  }

  return `Mentioned on ${platform.name}, at position ${state.position}.`;
}

/**
 * The label a screen reader reads for a cell the Snapshot cannot report a
 * Mention for.
 */
function noDataLabel(
  state: Extract<MentionState, { kind: "no-data" }>,
  platform: Platform,
): string {
  if (state.reason === "no-answer") {
    return `No answer on ${platform.name}.`;
  }

  return `No brand to measure on ${platform.name}.`;
}

/** The category of a tracked Prompt, as a quiet badge. */
function CategoryBadge({ category }: { category: PromptCategory }) {
  return <Badge variant="secondary">{CATEGORY_LABELS[category]}</Badge>;
}
